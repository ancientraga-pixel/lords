package org.herbionyx.chaincode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;

import com.owlike.genson.Genson;

/**
 * HERBIONYX - Ayurvedic Herbs Traceability System
 * Java Chaincode for Hyperledger Fabric
 * 
 * This chaincode implements complete traceability for Ayurvedic herbs
 * from farm collection to final consumer products, with quality gates,
 * geo-fencing, IPFS integration, and regulatory compliance.
 */
@Contract(
    name = "HerbTraceability",
    info = @Info(
        title = "Herb Traceability Contract",
        description = "Complete traceability system for Ayurvedic herbs",
        version = "1.0.0",
        license = @License(
            name = "Apache 2.0 License",
            url = "http://www.apache.org/licenses/LICENSE-2.0.html"),
        contact = @Contact(
            email = "admin@herbionyx.com",
            name = "HERBIONYX Admin")))
@Default
public final class HerbTraceability implements ContractInterface {

    private final Genson genson = new Genson();

    // Error types
    private enum HerbTraceabilityErrors {
        COLLECTION_NOT_FOUND,
        QUALITY_TEST_NOT_FOUND,
        PROCESSING_NOT_FOUND,
        BATCH_NOT_FOUND,
        UNAUTHORIZED_ACCESS,
        INVALID_GEOFENCE,
        QUALITY_GATE_FAILED,
        INSUFFICIENT_PERMISSIONS,
        SEASONAL_RESTRICTION_VIOLATION,
        YIELD_LIMIT_EXCEEDED
    }

    /**
     * Record a new collection event from farmer/collector
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public CollectionEvent recordCollectionEvent(final Context ctx, final String eventData) {
        ChaincodeStub stub = ctx.getStub();
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify collector permissions
        if (!clientMSPID.equals("FarmersCoopMSP")) {
            throw new ChaincodeException("Only registered collectors can record collection events", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        CollectionEventData data = genson.deserialize(eventData, CollectionEventData.class);
        String eventId = generateEventId(stub);
        
        // Validate geo-fencing
        if (!validateGeoFence(stub, data.latitude, data.longitude)) {
            throw new ChaincodeException("Collection location is not in an approved zone", 
                HerbTraceabilityErrors.INVALID_GEOFENCE.toString());
        }
        
        // Validate seasonal restrictions (Oct-Mar for Ashwagandha)
        if (!validateSeasonalRestrictions(data.species, data.timestamp)) {
            throw new ChaincodeException("Collection outside permitted seasonal window", 
                HerbTraceabilityErrors.SEASONAL_RESTRICTION_VIOLATION.toString());
        }
        
        // Check yield limits for the zone
        if (!checkYieldLimits(stub, data.latitude, data.longitude, data.weight)) {
            throw new ChaincodeException("Collection would exceed zone yield limits", 
                HerbTraceabilityErrors.YIELD_LIMIT_EXCEEDED.toString());
        }

        CollectionEvent event = new CollectionEvent();
        event.eventId = eventId;
        event.species = data.species;
        event.weight = data.weight;
        event.latitude = data.latitude;
        event.longitude = data.longitude;
        event.timestamp = data.timestamp;
        event.collectorId = ctx.getClientIdentity().getId();
        event.collectorMSP = clientMSPID;
        event.imageHash = data.imageHash;
        event.metadataHash = data.metadataHash;
        event.status = "COLLECTED";
        event.qrCode = generateQRCode(eventId, "collection");

        String eventKey = "COLLECTION_" + eventId;
        stub.putStringState(eventKey, genson.serialize(event));
        
        // Update zone yield tracking
        updateZoneYield(stub, data.latitude, data.longitude, data.weight);
        
        // Emit collection event
        stub.setEvent("CollectionRecorded", genson.serialize(event).getBytes());
        
        return event;
    }

    /**
     * Record quality attestation from lab
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public QualityAttestation qualityAttestation(final Context ctx, final String attestationData) {
        ChaincodeStub stub = ctx.getStub();
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify lab technician permissions
        if (!clientMSPID.equals("LabsOrgMSP")) {
            throw new ChaincodeException("Only registered lab technicians can perform quality attestation", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        QualityAttestationData data = genson.deserialize(attestationData, QualityAttestationData.class);
        
        // Verify collection event exists
        String collectionKey = "COLLECTION_" + data.eventId;
        String collectionStateJSON = stub.getStringState(collectionKey);
        if (collectionStateJSON.isEmpty()) {
            throw new ChaincodeException("Collection event not found", 
                HerbTraceabilityErrors.COLLECTION_NOT_FOUND.toString());
        }

        // Validate quality thresholds (NMPB/GACP standards)
        if (!validateQualityGates(data.testResults)) {
            throw new ChaincodeException("Batch failed quality gate validation", 
                HerbTraceabilityErrors.QUALITY_GATE_FAILED.toString());
        }

        String testId = generateTestId(stub);
        
        QualityAttestation attestation = new QualityAttestation();
        attestation.testId = testId;
        attestation.eventId = data.eventId;
        attestation.moistureContent = data.testResults.moisture;
        attestation.pesticidesLevel = data.testResults.pesticides;
        attestation.heavyMetalsLevel = data.testResults.heavyMetals;
        attestation.microbialTest = data.testResults.microbial;
        attestation.passed = data.passed;
        attestation.labTechId = ctx.getClientIdentity().getId();
        attestation.labMSP = clientMSPID;
        attestation.testDate = data.timestamp;
        attestation.imageHash = data.imageHash;
        attestation.metadataHash = data.metadataHash;
        attestation.qrCode = generateQRCode(testId, "quality");

        String testKey = "QUALITY_" + testId;
        stub.putStringState(testKey, genson.serialize(attestation));
        
        // Update collection event status
        CollectionEvent collection = genson.deserialize(collectionStateJSON, CollectionEvent.class);
        collection.status = data.passed ? "QUALITY_PASSED" : "QUALITY_FAILED";
        stub.putStringState(collectionKey, genson.serialize(collection));
        
        // Emit quality event
        stub.setEvent("QualityAttested", genson.serialize(attestation).getBytes());
        
        return attestation;
    }

    /**
     * Transfer custody to processor
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public ProcessingRecord transferCustody(final Context ctx, final String custodyData) {
        ChaincodeStub stub = ctx.getStub();
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify processor permissions
        if (!clientMSPID.equals("ProcessorsOrgMSP")) {
            throw new ChaincodeException("Only registered processors can transfer custody", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        CustodyTransferData data = genson.deserialize(custodyData, CustodyTransferData.class);
        
        // Verify quality test exists and passed
        String qualityKey = "QUALITY_" + data.testId;
        String qualityStateJSON = stub.getStringState(qualityKey);
        if (qualityStateJSON.isEmpty()) {
            throw new ChaincodeException("Quality test not found", 
                HerbTraceabilityErrors.QUALITY_TEST_NOT_FOUND.toString());
        }
        
        QualityAttestation quality = genson.deserialize(qualityStateJSON, QualityAttestation.class);
        if (!quality.passed) {
            throw new ChaincodeException("Cannot process batch that failed quality tests", 
                HerbTraceabilityErrors.QUALITY_GATE_FAILED.toString());
        }

        String processId = generateProcessId(stub);
        
        ProcessingRecord processing = new ProcessingRecord();
        processing.processId = processId;
        processing.testId = data.testId;
        processing.eventId = quality.eventId;
        processing.processType = data.processType;
        processing.temperature = data.temperature;
        processing.duration = data.duration;
        processing.yield = data.yield;
        processing.processorId = ctx.getClientIdentity().getId();
        processing.processorMSP = clientMSPID;
        processing.processDate = data.timestamp;
        processing.imageHash = data.imageHash;
        processing.metadataHash = data.metadataHash;
        processing.status = "PROCESSED";
        processing.qrCode = generateQRCode(processId, "processing");

        String processKey = "PROCESSING_" + processId;
        stub.putStringState(processKey, genson.serialize(processing));
        
        // Emit processing event
        stub.setEvent("CustodyTransferred", genson.serialize(processing).getBytes());
        
        return processing;
    }

    /**
     * Create final product batch by manufacturer
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public ProductBatch batchCreation(final Context ctx, final String batchData) {
        ChaincodeStub stub = ctx.getStub();
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify manufacturer permissions
        if (!clientMSPID.equals("ManufacturersOrgMSP")) {
            throw new ChaincodeException("Only registered manufacturers can create final products", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        BatchCreationData data = genson.deserialize(batchData, BatchCreationData.class);
        
        // Verify processing record exists
        String processKey = "PROCESSING_" + data.processId;
        String processStateJSON = stub.getStringState(processKey);
        if (processStateJSON.isEmpty()) {
            throw new ChaincodeException("Processing record not found", 
                HerbTraceabilityErrors.PROCESSING_NOT_FOUND.toString());
        }

        String batchId = generateBatchId(stub);
        
        // Get complete provenance chain
        ProvenanceChain provenance = buildProvenanceChain(stub, data.processId);
        
        ProductBatch batch = new ProductBatch();
        batch.batchId = batchId;
        batch.processId = data.processId;
        batch.productName = data.productName;
        batch.batchSize = data.batchSize;
        batch.formulation = data.formulation;
        batch.expiryDate = data.expiryDate;
        batch.manufacturerId = ctx.getClientIdentity().getId();
        batch.manufacturerMSP = clientMSPID;
        batch.manufacturingDate = data.timestamp;
        batch.imageHash = data.imageHash;
        batch.metadataHash = data.metadataHash;
        batch.provenanceChain = provenance;
        batch.status = "MANUFACTURED";
        batch.qrCode = generateQRCode(batchId, "final-product");

        String batchKey = "BATCH_" + batchId;
        stub.putStringState(batchKey, genson.serialize(batch));
        
        // Emit batch creation event
        stub.setEvent("BatchCreated", genson.serialize(batch).getBytes());
        
        return batch;
    }

    /**
     * Validate geographic boundaries (mock implementation)
     */
    private boolean validateGeoFence(ChaincodeStub stub, double latitude, double longitude) {
        // Mock zones for demo (Rajasthan, Gujarat, Maharashtra, Karnataka, Tamil Nadu)
        ApprovedZone[] zones = {
            new ApprovedZone("Rajasthan Zone 1", 26.9124, 75.7873, 27.2124, 76.0873, 500),
            new ApprovedZone("Gujarat Zone 1", 23.0225, 72.5714, 23.3225, 72.8714, 400),
            new ApprovedZone("Maharashtra Zone 1", 19.0760, 72.8777, 19.3760, 73.1777, 600),
            new ApprovedZone("Karnataka Zone 1", 12.9716, 77.5946, 13.2716, 77.8946, 450),
            new ApprovedZone("Tamil Nadu Zone 1", 13.0827, 80.2707, 13.3827, 80.5707, 350)
        };
        
        for (ApprovedZone zone : zones) {
            if (latitude >= zone.minLat && latitude <= zone.maxLat &&
                longitude >= zone.minLng && longitude <= zone.maxLng) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validate seasonal restrictions for collection
     */
    private boolean validateSeasonalRestrictions(String species, String timestamp) {
        // Mock seasonal validation for Ashwagandha (Oct-Mar)
        if ("Ashwagandha".equals(species)) {
            // Parse timestamp and check if it's in Oct-Mar window
            // For demo, assume valid collection period
            return true;
        }
        return true;
    }

    /**
     * Check yield limits for zone
     */
    private boolean checkYieldLimits(ChaincodeStub stub, double latitude, double longitude, double weight) {
        // Mock yield tracking - in production, would track per zone
        return weight <= 500.0; // Max 500kg per collection
    }

    /**
     * Update zone yield tracking
     */
    private void updateZoneYield(ChaincodeStub stub, double latitude, double longitude, double weight) {
        // Mock implementation - would track actual zone yields
        String yieldKey = "ZONE_YIELD_" + ((int)(latitude * 100)) + "_" + ((int)(longitude * 100));
        String currentYieldJSON = stub.getStringState(yieldKey);
        
        double totalYield = weight;
        if (!currentYieldJSON.isEmpty()) {
            ZoneYield zoneYield = genson.deserialize(currentYieldJSON, ZoneYield.class);
            totalYield += zoneYield.totalYield;
        }
        
        ZoneYield zoneYield = new ZoneYield();
        zoneYield.zoneId = yieldKey;
        zoneYield.totalYield = totalYield;
        zoneYield.lastUpdated = java.time.Instant.now().toString();
        
        stub.putStringState(yieldKey, genson.serialize(zoneYield));
    }

    /**
     * Validate quality gates (NMPB/GACP standards)
     */
    private boolean validateQualityGates(TestResults results) {
        return results.moisture < 12.0 &&         // Max 12% moisture
               results.pesticides < 0.01 &&       // Max 0.01 mg/kg pesticides
               results.heavyMetals < 10.0 &&      // Max 10 ppm heavy metals
               "Negative".equals(results.microbial); // Must be negative for microbial
    }

    /**
     * Build complete provenance chain
     */
    private ProvenanceChain buildProvenanceChain(ChaincodeStub stub, String processId) {
        ProvenanceChain chain = new ProvenanceChain();
        List<ProvenanceStep> steps = new ArrayList<>();
        
        // Get processing record
        String processKey = "PROCESSING_" + processId;
        String processJSON = stub.getStringState(processKey);
        ProcessingRecord processing = genson.deserialize(processJSON, ProcessingRecord.class);
        
        // Get quality record
        String qualityKey = "QUALITY_" + processing.testId;
        String qualityJSON = stub.getStringState(qualityKey);
        QualityAttestation quality = genson.deserialize(qualityJSON, QualityAttestation.class);
        
        // Get collection record
        String collectionKey = "COLLECTION_" + quality.eventId;
        String collectionJSON = stub.getStringState(collectionKey);
        CollectionEvent collection = genson.deserialize(collectionJSON, CollectionEvent.class);
        
        // Build provenance steps
        ProvenanceStep collectionStep = new ProvenanceStep();
        collectionStep.stage = "Collection";
        collectionStep.timestamp = collection.timestamp;
        collectionStep.organization = "FarmersCoop";
        collectionStep.latitude = collection.latitude;
        collectionStep.longitude = collection.longitude;
        collectionStep.details = Map.of(
            "species", collection.species,
            "weight", String.valueOf(collection.weight),
            "collector", collection.collectorId
        );
        collectionStep.imageHash = collection.imageHash;
        collectionStep.metadataHash = collection.metadataHash;
        steps.add(collectionStep);
        
        ProvenanceStep qualityStep = new ProvenanceStep();
        qualityStep.stage = "Quality Testing";
        qualityStep.timestamp = quality.testDate;
        qualityStep.organization = "LabsOrg";
        qualityStep.details = Map.of(
            "moisture", String.valueOf(quality.moistureContent),
            "pesticides", String.valueOf(quality.pesticidesLevel),
            "heavyMetals", String.valueOf(quality.heavyMetalsLevel),
            "microbial", quality.microbialTest,
            "passed", String.valueOf(quality.passed)
        );
        qualityStep.imageHash = quality.imageHash;
        qualityStep.metadataHash = quality.metadataHash;
        steps.add(qualityStep);
        
        ProvenanceStep processingStep = new ProvenanceStep();
        processingStep.stage = "Processing";
        processingStep.timestamp = processing.processDate;
        processingStep.organization = "ProcessorsOrg";
        processingStep.details = Map.of(
            "processType", processing.processType,
            "temperature", String.valueOf(processing.temperature),
            "duration", String.valueOf(processing.duration),
            "yield", String.valueOf(processing.yield)
        );
        processingStep.imageHash = processing.imageHash;
        processingStep.metadataHash = processing.metadataHash;
        steps.add(processingStep);
        
        chain.steps = steps;
        chain.totalSteps = steps.size();
        chain.verified = true;
        
        return chain;
    }

    /**
     * Generate QR code data
     */
    private String generateQRCode(String id, String type) {
        return String.format("{\"id\":\"%s\",\"type\":\"%s\",\"timestamp\":\"%s\",\"network\":\"herbionyx\"}", 
            id, type, java.time.Instant.now().toString());
    }

    // ID Generation Methods
    private String generateEventId(ChaincodeStub stub) {
        return "EVT_" + System.currentTimeMillis() + "_" + stub.getTxId().substring(0, 8);
    }

    private String generateTestId(ChaincodeStub stub) {
        return "TEST_" + System.currentTimeMillis() + "_" + stub.getTxId().substring(0, 8);
    }

    private String generateProcessId(ChaincodeStub stub) {
        return "PROC_" + System.currentTimeMillis() + "_" + stub.getTxId().substring(0, 8);
    }

    private String generateBatchId(ChaincodeStub stub) {
        return "BATCH_" + System.currentTimeMillis() + "_" + stub.getTxId().substring(0, 8);
    }

    // Query Functions

    /**
     * Get collection event by ID
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public CollectionEvent getCollectionEvent(final Context ctx, final String eventId) {
        ChaincodeStub stub = ctx.getStub();
        String eventKey = "COLLECTION_" + eventId;
        String eventJSON = stub.getStringState(eventKey);

        if (eventJSON.isEmpty()) {
            throw new ChaincodeException("Collection event not found", 
                HerbTraceabilityErrors.COLLECTION_NOT_FOUND.toString());
        }

        return genson.deserialize(eventJSON, CollectionEvent.class);
    }

    /**
     * Get quality attestation by test ID
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public QualityAttestation getQualityTest(final Context ctx, final String testId) {
        ChaincodeStub stub = ctx.getStub();
        String testKey = "QUALITY_" + testId;
        String testJSON = stub.getStringState(testKey);

        if (testJSON.isEmpty()) {
            throw new ChaincodeException("Quality test not found", 
                HerbTraceabilityErrors.QUALITY_TEST_NOT_FOUND.toString());
        }

        return genson.deserialize(testJSON, QualityAttestation.class);
    }

    /**
     * Get processing details by process ID
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public ProcessingRecord getProcessingDetails(final Context ctx, final String processId) {
        ChaincodeStub stub = ctx.getStub();
        String processKey = "PROCESSING_" + processId;
        String processJSON = stub.getStringState(processKey);

        if (processJSON.isEmpty()) {
            throw new ChaincodeException("Processing record not found", 
                HerbTraceabilityErrors.PROCESSING_NOT_FOUND.toString());
        }

        return genson.deserialize(processJSON, ProcessingRecord.class);
    }

    /**
     * Get complete provenance for consumer verification
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public ProductBatch getProvenance(final Context ctx, final String batchId) {
        ChaincodeStub stub = ctx.getStub();
        String batchKey = "BATCH_" + batchId;
        String batchJSON = stub.getStringState(batchKey);

        if (batchJSON.isEmpty()) {
            throw new ChaincodeException("Product batch not found", 
                HerbTraceabilityErrors.BATCH_NOT_FOUND.toString());
        }

        return genson.deserialize(batchJSON, ProductBatch.class);
    }

    /**
     * Get all approved zones (for admin)
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public String getApprovedZones(final Context ctx) {
        // Mock zones data
        ApprovedZone[] zones = {
            new ApprovedZone("Rajasthan Zone 1", 26.9124, 75.7873, 27.2124, 76.0873, 500),
            new ApprovedZone("Gujarat Zone 1", 23.0225, 72.5714, 23.3225, 72.8714, 400),
            new ApprovedZone("Maharashtra Zone 1", 19.0760, 72.8777, 19.3760, 73.1777, 600),
            new ApprovedZone("Karnataka Zone 1", 12.9716, 77.5946, 13.2716, 77.8946, 450),
            new ApprovedZone("Tamil Nadu Zone 1", 13.0827, 80.2707, 13.3827, 80.5707, 350)
        };
        
        return genson.serialize(zones);
    }

    // Administrative Functions

    /**
     * Update approved zones (admin only)
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public String updateApprovedZones(final Context ctx, final String zoneData) {
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify NMPB admin permissions
        if (!clientMSPID.equals("NMPBOrgMSP")) {
            throw new ChaincodeException("Only NMPB admins can update approved zones", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        ChaincodeStub stub = ctx.getStub();
        ZoneUpdateData data = genson.deserialize(zoneData, ZoneUpdateData.class);
        
        // Store zone update (in production, would update zone database)
        String zoneKey = "ZONE_UPDATE_" + System.currentTimeMillis();
        stub.putStringState(zoneKey, zoneData);
        
        // Emit zone update event
        stub.setEvent("ZoneUpdated", zoneData.getBytes());
        
        return "Zone update recorded successfully";
    }

    /**
     * Initiate product recall (admin only)
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public String initiateRecall(final Context ctx, final String recallData) {
        String clientMSPID = ctx.getClientIdentity().getMSPID();
        
        // Verify NMPB admin permissions
        if (!clientMSPID.equals("NMPBOrgMSP")) {
            throw new ChaincodeException("Only NMPB admins can initiate recalls", 
                HerbTraceabilityErrors.UNAUTHORIZED_ACCESS.toString());
        }

        ChaincodeStub stub = ctx.getStub();
        RecallData data = genson.deserialize(recallData, RecallData.class);
        
        String recallId = "RECALL_" + System.currentTimeMillis();
        
        RecallNotice recall = new RecallNotice();
        recall.recallId = recallId;
        recall.batchId = data.batchId;
        recall.reason = data.reason;
        recall.initiatedBy = ctx.getClientIdentity().getId();
        recall.initiatedDate = data.timestamp;
        recall.status = "ACTIVE";
        
        String recallKey = "RECALL_" + recallId;
        stub.putStringState(recallKey, genson.serialize(recall));
        
        // Emit recall event
        stub.setEvent("RecallInitiated", genson.serialize(recall).getBytes());
        
        return "Recall initiated successfully: " + recallId;
    }

    // Data Model Classes
    
    static class CollectionEventData {
        public String species;
        public double weight;
        public double latitude;
        public double longitude;
        public String timestamp;
        public String imageHash;
        public String metadataHash;
    }

    static class CollectionEvent {
        public String eventId;
        public String species;
        public double weight;
        public double latitude;
        public double longitude;
        public String timestamp;
        public String collectorId;
        public String collectorMSP;
        public String imageHash;
        public String metadataHash;
        public String status;
        public String qrCode;
    }

    static class QualityAttestationData {
        public String eventId;
        public TestResults testResults;
        public boolean passed;
        public String timestamp;
        public String imageHash;
        public String metadataHash;
    }

    static class TestResults {
        public double moisture;
        public double pesticides;
        public double heavyMetals;
        public String microbial;
    }

    static class QualityAttestation {
        public String testId;
        public String eventId;
        public double moistureContent;
        public double pesticidesLevel;
        public double heavyMetalsLevel;
        public String microbialTest;
        public boolean passed;
        public String labTechId;
        public String labMSP;
        public String testDate;
        public String imageHash;
        public String metadataHash;
        public String qrCode;
    }

    static class CustodyTransferData {
        public String testId;
        public String processType;
        public double temperature;
        public double duration;
        public double yield;
        public String timestamp;
        public String imageHash;
        public String metadataHash;
    }

    static class ProcessingRecord {
        public String processId;
        public String testId;
        public String eventId;
        public String processType;
        public double temperature;
        public double duration;
        public double yield;
        public String processorId;
        public String processorMSP;
        public String processDate;
        public String imageHash;
        public String metadataHash;
        public String status;
        public String qrCode;
    }

    static class BatchCreationData {
        public String processId;
        public String productName;
        public int batchSize;
        public String formulation;
        public String expiryDate;
        public String timestamp;
        public String imageHash;
        public String metadataHash;
    }

    static class ProductBatch {
        public String batchId;
        public String processId;
        public String productName;
        public int batchSize;
        public String formulation;
        public String expiryDate;
        public String manufacturerId;
        public String manufacturerMSP;
        public String manufacturingDate;
        public String imageHash;
        public String metadataHash;
        public ProvenanceChain provenanceChain;
        public String status;
        public String qrCode;
    }

    static class ProvenanceChain {
        public List<ProvenanceStep> steps;
        public int totalSteps;
        public boolean verified;
    }

    static class ProvenanceStep {
        public String stage;
        public String timestamp;
        public String organization;
        public double latitude;
        public double longitude;
        public Map<String, String> details;
        public String imageHash;
        public String metadataHash;
    }

    static class ApprovedZone {
        public String name;
        public double minLat;
        public double minLng;
        public double maxLat;
        public double maxLng;
        public int maxYield;
        
        public ApprovedZone(String name, double minLat, double minLng, double maxLat, double maxLng, int maxYield) {
            this.name = name;
            this.minLat = minLat;
            this.minLng = minLng;
            this.maxLat = maxLat;
            this.maxLng = maxLng;
            this.maxYield = maxYield;
        }
    }

    static class ZoneYield {
        public String zoneId;
        public double totalYield;
        public String lastUpdated;
    }

    static class ZoneUpdateData {
        public String action;
        public ApprovedZone zone;
    }

    static class RecallData {
        public String batchId;
        public String reason;
        public String timestamp;
    }

    static class RecallNotice {
        public String recallId;
        public String batchId;
        public String reason;
        public String initiatedBy;
        public String initiatedDate;
        public String status;
    }
}
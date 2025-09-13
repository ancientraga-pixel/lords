const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.dbPath = path.join(this.dataDir, 'herbionyx.json');
    this.ensureDataDirectory();
    this.initializeDatabase();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        users: [],
        permittedZones: [
          {
            id: 'zone_1',
            name: 'Rajasthan Zone 1',
            minLat: 26.9124,
            minLng: 75.7873,
            maxLat: 27.2124,
            maxLng: 76.0873,
            maxYield: 500,
            active: true
          },
          {
            id: 'zone_2',
            name: 'Gujarat Zone 1',
            minLat: 23.0225,
            minLng: 72.5714,
            maxLat: 23.3225,
            maxLng: 72.8714,
            maxYield: 400,
            active: true
          },
          {
            id: 'zone_3',
            name: 'Maharashtra Zone 1',
            minLat: 19.0760,
            minLng: 72.8777,
            maxLat: 19.3760,
            maxLng: 73.1777,
            maxYield: 600,
            active: true
          }
        ],
        permittedHerbs: [
          // Comprehensive list of 140 registered Ayurvedic herbs
          { id: 'herb_1', name: 'Talispatra', scientificName: 'Abies webbiana Lindl', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_2', name: 'Chirmati', scientificName: 'Abrus precatorius Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_3', name: 'Katha', scientificName: 'Acacia catechu (L.f.) Willd', seasonStart: 'December', seasonEnd: 'April', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_4', name: 'Vatsnabh', scientificName: 'Aconitum chasmanthum Stapf', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_5', name: 'Vatsnabh', scientificName: 'Aconitum ferox Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_6', name: 'Atees', scientificName: 'Aconitum heterophyllum Wall. ex Royle', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_7', name: 'Vach', scientificName: 'Acorus calamus Linn.', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_8', name: 'Adusa', scientificName: 'Adhatoda zeylanica Medic.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_9', name: 'Beal', scientificName: 'Aegle marmelos (Linn) Corr.', seasonStart: 'March', seasonEnd: 'June', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_10', name: 'Shirish', scientificName: 'Albizzia lebback Benth.', seasonStart: 'February', seasonEnd: 'May', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_11', name: 'Ghritkumari', scientificName: 'Aloe vera (Linn.) Burn.', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 100, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_12', name: 'Smaller Galanga', scientificName: 'Alpinia calcarata Rosc.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_13', name: 'Greater Galanga', scientificName: 'Alpinia galangal Willd', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_14', name: 'Satvin', scientificName: 'Alstonia scholaris R.Br.', seasonStart: 'November', seasonEnd: 'March', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_15', name: 'Silarasa', scientificName: 'Altingia excelsa Noronha', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_16', name: 'Akarkara', scientificName: 'Anacyclus pyrethrum DC.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_17', name: 'Kalmegh', scientificName: 'Andrographis paniculata (Linn.) Burn', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 55, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_18', name: 'Agar', scientificName: 'Aquilaria agallocha Roxb.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_19', name: 'Artemisia', scientificName: 'Artemisia annua (Linn.)', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_20', name: 'Shatavari', scientificName: 'Asparagus racemosus Willd.', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_21', name: 'Atropa', scientificName: 'Atropa belledona Linn', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 10, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_22', name: 'Neem', scientificName: 'Azadirachta indica A. Juss', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 75, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_23', name: 'Brahmi', scientificName: 'Bacopa monnieri (L.) Pennell', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_24', name: 'Daruhaldi', scientificName: 'Berberis aristata DC.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_25', name: 'Pashnabheda', scientificName: 'Bergenia ciliata Stern.', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_26', name: 'Punarnava', scientificName: 'Boerhaavia diffusa Linn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_27', name: 'Patang', scientificName: 'Caesalpinia sappan Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_28', name: 'Senna', scientificName: 'Cassia angustifolia Vahl.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_29', name: 'Sadabahar', scientificName: 'Catharanthus roseus (L.) G.Don)', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_30', name: 'Malkangani', scientificName: 'Celastrus paniculatus Willd.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_31', name: 'Mandookparni', scientificName: 'Centella asiatica (Linn.) Urban', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_32', name: 'ShwetMusali', scientificName: 'Chlorophytum borivillianum Sant.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_33', name: 'Tezpatta', scientificName: 'Cinnamomum tamala (Buch.-Ham.) T.Nees', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_34', name: 'Dalchini', scientificName: 'Cinnamomum verum Presl', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_35', name: 'Kapoor', scientificName: 'Cinnamomum camphora Linn.', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_36', name: 'Arni', scientificName: 'Clerodendrum phlomoides L.f', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_37', name: 'Aparajita', scientificName: 'Clitoria ternatea L.', seasonStart: 'September', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_38', name: 'Pather Chur', scientificName: 'Coleus barbatus Benth.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_39', name: 'Hrivera', scientificName: 'Coleus vettiveroides K.C. Jacob', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_40', name: 'Guggal', scientificName: 'Commiphora wightii (Arn.) Bhandari', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_41', name: 'Shankhpushpi', scientificName: 'Convolvulus microphyllus Choisy', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_42', name: 'Mamira', scientificName: 'Coptis teeta Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_43', name: 'Peela Chandan', scientificName: 'Coscinum fenastratum (Gertn) Colebr.', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_44', name: 'Varun', scientificName: 'Crataeva nurvala Buch – Ham.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_45', name: 'Krsnasariva', scientificName: 'Cryptolepis buchanani Roem & schult', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_46', name: 'Kali Musali', scientificName: 'Curculigo orchioides Gaertn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_47', name: 'Tikhur', scientificName: 'Curcuma augustifolia Roxb.', seasonStart: 'January', seasonEnd: 'April', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 10, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_48', name: 'Nannari', scientificName: 'Decalepis hamiltonii Wight & Arn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_49', name: 'Salampanja', scientificName: 'Dactylorhiza hatagirea (D.Don)', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_50', name: 'Sarivan', scientificName: 'Desmodium gangeticum (L.) DC.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_51', name: 'Foxglove', scientificName: 'Digitalis purpurea Linn.', seasonStart: 'June', seasonEnd: 'August', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_52', name: 'Rotalu', scientificName: 'Dioscorea bulbifera Linn.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_53', name: 'Bringaraj', scientificName: 'Eclipta alba Hassk.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_54', name: 'Vai Vidang', scientificName: 'Embelia ribes Burm. f.', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_55', name: 'Amla', scientificName: 'Emblica officinalis Gaertn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 80, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_56', name: 'Somlata', scientificName: 'Ephedra gerardiana Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_57', name: 'Hing', scientificName: 'Ferula foetida Regel.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 10, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_58', name: 'Kokum', scientificName: 'Garcinia indica Choisy', seasonStart: 'April', seasonEnd: 'June', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_59', name: 'Trayamana', scientificName: 'Gentiana kurroo Royle', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_60', name: 'Ginkgo', scientificName: 'Ginkgo biloba Linn.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_61', name: 'Kalihari', scientificName: 'Gloriosa superba Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_62', name: 'Mulethi', scientificName: 'Glycyrrhiza glabra Linn.', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_63', name: 'Gambhari', scientificName: 'Gmelina arborea Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_64', name: 'Gudmar', scientificName: 'Gymnema sylvestre R. Br.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_65', name: 'Kapurkachari', scientificName: 'Hedychium spicatum Buch-Ham. ex Smuth', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_66', name: 'Anantmool', scientificName: 'Hemidesmus indicus R.Br.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_67', name: 'Seabuckthorn', scientificName: 'Hippophae rhamnoides Linn.', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_68', name: 'Kutaj', scientificName: 'Holarrhena antidysenterica Wall.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_69', name: 'Khurasaniajwane', scientificName: 'Hyoscyamus niger L.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_70', name: 'Pushkarmool', scientificName: 'Inula racemosa Hk. f.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_71', name: 'Giant potato', scientificName: 'Ipomoea mauritiana', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 70, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_72', name: 'Vrddhadaruka', scientificName: 'Ipomoea petaloidea Choisy', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_73', name: 'Trivrit', scientificName: 'Ipomoea turpethum R. Br.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_74', name: 'Hapushal', scientificName: 'Juniperus cumminis Linn', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_75', name: 'Dhoop', scientificName: 'Jurineana crocephala Benth.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_76', name: 'Indian crocus', scientificName: 'Kaempferia galangal Linn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_77', name: 'Chandrasur', scientificName: 'Lepidum sativum Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_78', name: 'Jivanti', scientificName: 'Leptadenia reticulate (Retz) Wt. &Arn.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_79', name: 'Listea', scientificName: 'Litsea glutinosa (Lour.) C.B. Rob', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_80', name: 'Ghanera', scientificName: 'Mappia foetida Miers.', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_81', name: 'Nagakeshar', scientificName: 'Mesua ferrea Linn.', seasonStart: 'March', seasonEnd: 'May', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_82', name: 'Sahjan', scientificName: 'Moringa olifera Lam', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_83', name: 'Konch', scientificName: 'Mucuna prurita Linn.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_84', name: 'Jatamansi', scientificName: 'Nardostachys jatamansi DC.', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_85', name: 'Tulsi', scientificName: 'Ocimum sanctum Linn.', seasonStart: 'January', seasonEnd: 'December', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_86', name: 'Ratanjot', scientificName: 'Onosma hispidum Wall.ex Don', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_87', name: 'Syonaka', scientificName: 'Oroxylum indicum Vent.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_88', name: 'Ginseng', scientificName: 'Panax pseudo-ginseng Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_89', name: 'Bhumi amlaki', scientificName: 'Phyllanthus amarus Schum & Thonn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_90', name: 'Kutki', scientificName: 'Picrorhiza kurroa Benth. ex Royle', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_91', name: 'Kababchini', scientificName: 'Piper cubeba Linn. f.', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_92', name: 'Pippali', scientificName: 'Piper longum Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_93', name: 'Isabgol', scientificName: 'Plantago ovate Forks', seasonStart: 'February', seasonEnd: 'April', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_94', name: 'Rasna', scientificName: 'Pluchea lanceolata (DC) CB Clark.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_95', name: 'Leadwort', scientificName: 'Plumbago rosea Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_96', name: 'Chitrak', scientificName: 'Plumbago zeylanica Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_97', name: 'Bankakri', scientificName: 'Podophyllum hexandrum Royle.', seasonStart: 'August', seasonEnd: 'September', maxYieldPerCollection: 10, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_98', name: 'Mahameda', scientificName: 'Polygonatum cirrhifolium Wall.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_99', name: 'Agnimanth', scientificName: 'Premna integrifolia Linn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_100', name: 'Moovila', scientificName: 'Pseudarthria viscida (L.) Wight & Arn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_101', name: 'Bakuchi', scientificName: 'Psoralea corylifolia L.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_102', name: 'Beejasar', scientificName: 'Pterocarpus marsupium Roxb.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_103', name: 'Raktachandan', scientificName: 'Pterocarpus santalinus L.f', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_104', name: 'Vidarikand', scientificName: 'Pueraria tuberosa DC.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_105', name: 'Sarpgandha', scientificName: 'Rauwolfia serpentina Benth. ex Kurz', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_106', name: 'Archa', scientificName: 'Rheum emodi Wall. ex Meisn.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_107', name: 'Manjishtha', scientificName: 'Rubia cordifolia Linn', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_108', name: 'Saptachakra', scientificName: 'Salacia reticulata Wright', seasonStart: 'November', seasonEnd: 'January', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_109', name: 'Chandan', scientificName: 'Santalum album Linn.', seasonStart: 'December', seasonEnd: 'March', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_110', name: 'Ashok', scientificName: 'Saraca asoca (Roxb.) De Wilde', seasonStart: 'February', seasonEnd: 'April', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_111', name: 'Kuth', scientificName: 'Saussurea costus C.B. Clarke', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_112', name: 'Flannel weed', scientificName: 'Sida cordifolia Linn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_113', name: 'Hrddhatri', scientificName: 'Smilax china Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_114', name: 'Katheli-badhi', scientificName: 'Solanum anguivi Lam.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_115', name: 'Makoy', scientificName: 'Solanum nigrum Linn.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_116', name: 'Patala', scientificName: 'Stereospermum suaveolens DC.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_117', name: 'Madhukari', scientificName: 'Stevia rebaudiana Bertoni', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_118', name: 'Chirata', scientificName: 'Swertia chirata Buch-Ham', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_119', name: 'Lodh', scientificName: 'Symplocos racemosa Roxb', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_120', name: 'Rohitak', scientificName: 'Tacomella undulate (Sm.) Seem.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_121', name: 'Thuner', scientificName: 'Taxus wallichiana Linn.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 15, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_122', name: 'Sharapunkha', scientificName: 'Tephrosia purpurea Pers', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_123', name: 'Arjuna', scientificName: 'Terminalia arjuna (Roxb.) Wt. &Arn.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_124', name: 'Behera', scientificName: 'Terminalia bellirica Gaertn.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 60, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_125', name: 'Harad', scientificName: 'Terminalia chebula Retz.', seasonStart: 'October', seasonEnd: 'January', maxYieldPerCollection: 65, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_126', name: 'Giloe', scientificName: 'Tinospora cordifolia Miers', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 55, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_127', name: 'Barhanta', scientificName: 'Tragia involucrate Linn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_128', name: 'Patolpanchang', scientificName: 'Trichosanthes cucumerina Linn.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 45, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_129', name: 'Jeevani', scientificName: 'Tricopus zeylanicus Gärtner.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_130', name: 'Damabooti', scientificName: 'Tylophora asthmetica (L.f.) Wight & Arn.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_131', name: 'Prishnaparni', scientificName: 'Urarea picta (Jacq.) Desv.', seasonStart: 'October', seasonEnd: 'December', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_132', name: 'Tagar-ganth', scientificName: 'Valeriana hardwickii Wall.', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 20, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_133', name: 'Indian Valerian', scientificName: 'Valeriana wallichi DC', seasonStart: 'August', seasonEnd: 'October', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_134', name: 'Mandadhupa', scientificName: 'Vateria indica L.', seasonStart: 'November', seasonEnd: 'February', maxYieldPerCollection: 30, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_135', name: 'Khas-khas grass', scientificName: 'Vetiveria zizanoides (L.) Nash', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 40, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_136', name: 'Bunafsha', scientificName: 'Viola odorata Linn.', seasonStart: 'February', seasonEnd: 'April', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_137', name: 'Nirgundi', scientificName: 'Vitex nigundo L.', seasonStart: 'October', seasonEnd: 'February', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_138', name: 'Ashwagandha', scientificName: 'Withania somnifera (Linn.) Dunal', seasonStart: 'October', seasonEnd: 'March', maxYieldPerCollection: 50, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_139', name: 'Dhataki', scientificName: 'Woodfordia fruticosa Kurz.', seasonStart: 'February', seasonEnd: 'April', maxYieldPerCollection: 35, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true },
          { id: 'herb_140', name: 'Timoor', scientificName: 'Zanthoxylum alatum DC.', seasonStart: 'September', seasonEnd: 'November', maxYieldPerCollection: 25, qualityStandards: { moisture: { max: 12, unit: '%' }, pesticides: { max: 0.01, unit: 'mg/kg' }, heavyMetals: { max: 10, unit: 'ppm' } }, active: true }
        ],
        collections: [],
        qualityTests: [],
        processings: [],
        batches: [],
        qrCodes: []
      };
      
      this.saveData(initialData);
    }
  }

  loadData() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Database load error:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  }

  // Permitted Zones Management
  getPermittedZones() {
    const data = this.loadData();
    return data ? data.permittedZones.filter(zone => zone.active) : [];
  }

  addPermittedZone(zone) {
    const data = this.loadData();
    if (!data) return false;

    const newZone = {
      id: `zone_${Date.now()}`,
      ...zone,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedZones.push(newZone);
    return this.saveData(data);
  }

  updatePermittedZone(zoneId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex] = {
      ...data.permittedZones[zoneIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedZone(zoneId) {
    const data = this.loadData();
    if (!data) return false;

    const zoneIndex = data.permittedZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex === -1) return false;

    data.permittedZones[zoneIndex].active = false;
    data.permittedZones[zoneIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // Permitted Herbs Management
  getPermittedHerbs() {
    const data = this.loadData();
    return data ? data.permittedHerbs.filter(herb => herb.active) : [];
  }

  addPermittedHerb(herb) {
    const data = this.loadData();
    if (!data) return false;

    const newHerb = {
      id: `herb_${Date.now()}`,
      ...herb,
      active: true,
      createdAt: new Date().toISOString()
    };

    data.permittedHerbs.push(newHerb);
    return this.saveData(data);
  }

  updatePermittedHerb(herbId, updates) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex] = {
      ...data.permittedHerbs[herbIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveData(data);
  }

  deletePermittedHerb(herbId) {
    const data = this.loadData();
    if (!data) return false;

    const herbIndex = data.permittedHerbs.findIndex(herb => herb.id === herbId);
    if (herbIndex === -1) return false;

    data.permittedHerbs[herbIndex].active = false;
    data.permittedHerbs[herbIndex].deletedAt = new Date().toISOString();

    return this.saveData(data);
  }

  // QR Code Chain Management
  saveQRCode(qrData) {
    const data = this.loadData();
    if (!data) return false;

    data.qrCodes.push({
      id: qrData.id,
      data: qrData,
      createdAt: new Date().toISOString()
    });

    return this.saveData(data);
  }

  getQRChain(qrId) {
    const data = this.loadData();
    if (!data) return null;

    return data.qrCodes.find(qr => qr.id === qrId);
  }
}

module.exports = new Database();
class ProvinceController {
    static async getAllProvinces(req, res) {
        const ProvinceService = require('../../services/ProvinceService');
        const provinceService = new ProvinceService();
        try {
            const provinces = await provinceService.getAll();
            res.json(provinces);
        } catch (error) {
            console.error('Error fetching provinces:', error);
            res.status(500).json({ message: 'Error fetching provinces' });
        }
    }

    static async getProvinceById(req, res) {
        const id = req.params.id;
        const ProvinceService = require('../../services/ProvinceService');
        const provinceService = new ProvinceService();
        try {
            const province = await provinceService.getById(id);
            if (province) {
                res.json(province);
            } else {
                res.status(404).json({ message: 'Province not found' });
            }
        } catch (error) {
            console.error('Error fetching province by ID:', error);
            res.status(500).json({ message: 'Error fetching province' });
        }

    }

}

module.exports = ProvinceController;
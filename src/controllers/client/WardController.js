class WardController {
    static async getWardsByIdDistrict(req, res) {
        const idDistrict = req.params.id_district;
        const WardService = require('../../services/WardService');
        const wardService = new WardService();
        try {
            const wards = await wardService.getByDistrict(idDistrict);
            res.json(wards);
        } catch (error) {
            console.error('Error fetching wards:', error);
            res.status(500).json({ message: 'Error fetching wards' });
        }
    }

    static async getWardById(req, res) {
        const id = req.params.id;
        const WardService = require('../../services/WardService');
        const wardService = new WardService();
        try {
            const ward = await wardService.getById(id);
            if (ward) {
                res.json(ward);
            } else {
                res.status(404).json({ message: 'Ward not found' });
            }
        } catch (error) {
            console.error('Error fetching ward by ID:', error);
            res.status(500).json({ message: 'Error fetching ward' });
        }
    }

}

module.exports = WardController;
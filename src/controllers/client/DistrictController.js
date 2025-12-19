class DistrictController {
    static async getDistrictsByIdProvince(req, res) {
        const idProvince = req.params.id_province;
        const DistrictService = require('../../services/DistrictService');
        const districtService = new DistrictService();
        try {
            const districts = await districtService.getByIdProvince(idProvince);
            res.json(districts);
        } catch (error) {
            console.error('Error fetching districts:', error);
            res.status(500).json({ message: 'Error fetching districts' });
        }
    }

    static async getDistrictById(req, res) {
        const id = req.params.id;
        const DistrictService = require('../../services/DistrictService');
        const districtService = new DistrictService();
        try {
            const district = await districtService.getById(id);
            if (district) {
                res.json(district);
            } else {
                res.status(404).json({ message: 'District not found' });
            }
        } catch (error) {
            console.error('Error fetching district by ID:', error);
            res.status(500).json({ message: 'Error fetching district' });
        }
    }

}

module.exports = DistrictController;
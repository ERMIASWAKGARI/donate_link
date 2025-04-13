const Application = require("../../models/applicationModel");
const serviceApplication =  async (req, res) => {
  try {
    console.log("serviceApplication", req.body);
    const { NGO, donorId, needId, services,motivation, message } = req.body;

    // Validate required fields
    if (!NGO || !donorId || !needId || !services) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse services from stringified JSON (if needed)
    const servicesArray = typeof services === 'string' ? JSON.parse(services) : services;

    // Validate each service
    for (const service of servicesArray) {
      if ( !service.motivation || 
          !service.startDate || !service.endDate || !service.hoursPerWeek) {
        return res.status(400).json({ message: 'All service fields are required' });
      }
      
      if (new Date(service.endDate) <= new Date(service.startDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    const newDonation = new Application({
      NGO,
      donorId,
      needId,
      status: 'submitted',  
      motivation:services.motivation,
      donationType: 'service',
      services: servicesArray,
      message: message || ''
    });

    await newDonation.save();

    res.status(201).json({
      message: 'Service donation submitted successfully',
      donation: newDonation
    });
  } catch (error) {
    console.error('Error submitting service donation:', error);
    res.status(500).json({ message: 'Failed to submit service donation', error: error.message });
  }
}
const updateApplcationStatus= async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Assuming you're sending the new status in the request body

    // Find the application by ID and update its status
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
}

const getServiceDonations = async (req, res) => {
  console.log("getServiceDonations", req.params);
  try {
    const { ngoId, needId } = req.params;
    const donations = await Application.find({ needId, NGO: ngoId }).populate({ path: 'donorId', select: 'name email' });
    res.status(200).json({ donations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get service donations', error: error.message });
  }
}


module.exports = {
  serviceApplication,
  getServiceDonations,
  updateApplcationStatus
};


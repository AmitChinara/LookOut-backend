const Services = require("../models/serviceClass");
const ServiceActivity = require("../models/ServiceActivityLog");
const { broadcastStatusUpdate } = require("../services/WebSocketService");

const fetchAllStatus = async () => {
    let response = {
        data: {
            statusData: {},
            logData: {}
        },
        status: 200
    };
    try {
        response.data.statusData = await Services.find();
        response.data.logData = await ServiceActivity.find();
    } catch (error) {
        response.data = { message: error.message };
        response.status = 500;
    }

    return response;
};

const createStatus = async (data) => {
    let response = {
        data: {},
        status: 201,
    };
    try {
        const newService = new Services({
            id: data.id,
            createdBy: data.createdBy,
            name: data.name,
            status: data.status
        });
        response.data = await newService.save();

        const newServiceActivity = new ServiceActivity({
            id: response.data._id,
            createdBy: response.data.createdBy,
            logs: `The service ${response.data.name} is build with status of ${response.data.status}.`,
            serviceId: response.data._id
        })

        await newServiceActivity.save();

        // Broadcast update to all clients
        broadcastStatusUpdate({
            event: "SERVICE_CREATED",
            id: response.data._id,
            data: response.data,
            logs: newServiceActivity,
        });


    } catch (error) {
        response.data = { message: error.message };
        response.status = 500;
    }
    return response;
};

const updateStatus = async (id, status) => {
    let response = {
        data: {},
        status: 200,
    };
    try {
        response.data = await Services.findByIdAndUpdate(
            id,
            { status: status, updatedAt: Date.now() },
            { new: true }
        );
        if (!response.data) {
            response.status = 404;
            response.data = { message: 'Service not found' };
        } else {
            const newServiceActivity = new ServiceActivity({
                id: response.data._id,
                createdBy: response.data.createdBy,
                logs: `The service ${response.data.name} is updated with status of ${response.data.status}.`,
                serviceId: response.data._id
            })

            await newServiceActivity.save();
            // Broadcast update to all clients
            broadcastStatusUpdate({
                event: "STATUS_UPDATED",
                id: response.data._id,
                newStatus: response.data.status,
                logs: newServiceActivity,
            });
        }
    } catch (error) {
        response.data = { message: error.message };
        response.status = 500;
    }

    return response;
};

const deleteStatus = async (id) => {
    let response = {
        data: {},
        status: 200,
    };
    try {
        const deletedStatus = await Services.findByIdAndDelete(id);
        if (!deletedStatus) {
            response.status = 404;
            response.data = { message: 'Service not found' };
        } else {
            response.data = { message: `Service deleted successfully` };

            const newServiceActivity = new ServiceActivity({
                id: response.data._id,
                createdBy: response.data.createdBy || "xxxx",
                logs: `Deleting: ${response.data.message}`,
                serviceId: response.data._id || `${id}`
            })

            await newServiceActivity.save();
            // Broadcast update to all clients
            broadcastStatusUpdate({
                event: "SERVICE_DELETED",
                id: id,
                logs: newServiceActivity,
            });
        }
    } catch (error) {
        response.data = { message: error.message };
        response.status = 500;
    }

    return response;
};

module.exports = {
    fetchAllStatus,
    createStatus,
    updateStatus,
    deleteStatus,
};

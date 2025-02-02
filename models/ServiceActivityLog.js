const mongoose = require('mongoose');
const { Schema } = mongoose;
const baseSchema = require('./baseClass');

const serviceActivitySchema = new Schema(
    {
        logs: {
            type: String,
            required: true,
        },
        serviceId: {
            type: String,
            required: true,
        }
    }
);

serviceActivitySchema.add(baseSchema);

const ServiceActivity = mongoose.model('servicesActivities', serviceActivitySchema);

module.exports = ServiceActivity;
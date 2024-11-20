
const Plan = require('../models/planModel');
const BadRequestError = require('../../../../shared/errors/BadRequestError');
const { sendSuccess } = require('../../../../shared/utils/responseHandler');
const axios = require('axios');

const createPlan = async (req, res, next) => {
    const { category, location, date, time, people } = req.body;
    let {subcategory} = req.body;
    if(!subcategory) subcategory="";
    if (!category || !location || !date || !time || !Array.isArray(people)) {
        throw new BadRequestError('Category, location, date, time, and people array are required.');
    }

    if (people.length > 8) {
        throw new BadRequestError('A plan can have a maximum of 8 people.');
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    const invalidFormatIds = people.filter(id => !objectIdRegex.test(id));
    if (invalidFormatIds.length > 0) {
        throw new BadRequestError('One or more user IDs have an invalid format.', { invalidFormatIds });
    }

    if (people.includes(req.user.id)) {
        throw new BadRequestError('Creator cannot be included in the people array.');
    }

    const uniquePeople = [...new Set(people)];
    if (uniquePeople.length !== people.length) {
        const duplicates = people.filter((item, index) => people.indexOf(item) !== index);
        const uniqueDuplicates = Array.from(new Set(duplicates));
        throw new BadRequestError('Duplicate user IDs found in the people array.', { duplicateIds: uniqueDuplicates });
    }

    let friends = [];
    let friendsData = [];
    try {
        const token = req.headers.authorization;
        const friendsResponse = await axios.get(`${process.env.USER_SERVICE_URL}/${req.user.id}/friends`, {
            headers: { Authorization: token }
        });
        friendsData = friendsResponse.data.data.friends; 
        friends = friendsData.map(friend => friend.id); 
    } catch (error) {
        console.error('Error fetching friends:', error.message);
        throw new BadRequestError('Failed to fetch user friends.', { details: error.message });
    }

    const nonFriendIds = people.filter(id => !friends.includes(id));
    if (nonFriendIds.length > 0) {
        throw new BadRequestError('Some user IDs are not friends of the creator.', { nonFriendIds });
    }

    

    try {
        const existingPlan = await Plan.findOne({
            category,
            subcategory,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat]
            },
            date,
            time,
            createdBy: req.user.id
        });

        if (existingPlan) {
            throw new BadRequestError('A plan with the same details already exists.', { planId: existingPlan._id });
        }
    } catch (error) {
        if (!(error instanceof BadRequestError)) {
            return next(error);
        }
        throw error;
    }

    let creatorName = 'Unknown';
    try {
        const token = req.headers.authorization;
        const creatorResponse = await axios.get(`${process.env.USER_SERVICE_URL}/getUser/${req.user.id}`, {
            headers: {
                Authorization: token
            }
        });
        creatorName = creatorResponse.data.data.user.username;
    } catch (error) {
        console.error('Error fetching creator name:', error.message);
        throw new NotFoundError('Error fetching creator name.', error.message);
    }

    let peopleNames = [];
    if (people.length > 0) {
        try {
            peopleNames = people.map(id => {
                const friend = friendsData.find(f => f.id === id);
                return friend ? friend.username : 'Unknown';
            });
        } catch (error) {
            console.error('Error mapping people names:', error.message);
            throw new NotFoundError('Error mapping people names.', error.message);
        }
    }

    const status = people.length === 8 ? 'full' : 'open';

    try{
    const newPlan = new Plan({
        creatorName: creatorName,
        category,
        subcategory,
        location: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
        },
        date,
        time,
        people,
        createdBy: req.user.id,
        peopleNames: peopleNames,
        status: status
    });

    await newPlan.save();

    const response = {
        creatorName,
        category: newPlan.category,
        subcategory,
        location: {
            lat: newPlan.location.coordinates[1],
            lng: newPlan.location.coordinates[0]
        },
        date: newPlan.date,
        time: newPlan.time,
        createdAt: newPlan.createdAt,
        peopleCount: people.length,
        peopleNames,
        status: newPlan.status
    };

    sendSuccess(res, {
        data: response,
        message: 'Plan created successfully.'
    }, 201);
    }
    catch(error){
        throw new BadRequestError(error.message);
    }
};


const insertMultiplePlans = async (req, res, next) => {
    const { plans } = req.body;

    if (!Array.isArray(plans) || plans.length === 0) {
        throw new BadRequestError('An array of plans is required.');
    }

    try {
        const formattedPlans = plans.map(plan => {
            const { category, subcategory = "", location, date, time, people, createdBy, creatorName } = plan;

            if (!category || !location || !date || !time || !createdBy || !Array.isArray(people)) {
                throw new BadRequestError('Each plan must include category, location, date, time, createdBy, and a people array.');
            }

            if (people.length > 8) {
                throw new BadRequestError('A plan can have a maximum of 8 people.');
            }

            if (!location.lat || !location.lng) {
                throw new BadRequestError('Location must include valid lat and lng coordinates.');
            }

            return {
                category,
                subcategory,
                location: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                },
                date,
                time,
                people,
                createdBy,
                creatorName,
                status: people.length === 8 ? 'full' : 'open',
                peopleNames: plan.peopleNames || [] // Optional field
            };
        });

        const insertedPlans = await Plan.insertMany(formattedPlans);

        sendSuccess(res, {
            data: insertedPlans,
            message: 'Plans inserted successfully.'
        }, 201);
    } catch (error) {
        console.error('Error inserting plans:', error.message);
        next(error);
    }
};


const getAvailablePlans = async (req, res, next) => {
    try {
        
        const page = parseInt(req.query.page, 10) || 1; 
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;


        const query = {
            createdBy: req.user.id,
        };
        const plans = await Plan.find(query)
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPlans = await Plan.countDocuments(query);

        if (plans.length === 0) {
            return sendSuccess(res, {
                data: {
                    plans: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                },
                message: 'No available plans found for you to join.'
            }, 200);
        }

        const responsePlans = plans.map(plan => ({
            creatorName: plan.creatorName,
            category: plan.category,
            location: plan.location,
            date: plan.date,
            time: plan.time,
            createdAt: plan.createdAt,
            peopleCount: plan.people.length,
            peopleNames: plan.peopleNames || [],
            status: plan.status
        }));

        sendSuccess(res, {
            data: {
                plans: responsePlans,
                pagination: {
                    total: totalPlans,
                    page,
                    limit,
                    totalPages: Math.ceil(totalPlans / limit)
                }
            },
            message: 'Available plans retrieved successfully.'
        }, 200);
    } catch (error) {
        next(error); 
    }
};

const getAllAvailablePlans = async (req, res, next) => {
    try {
        
        const page = parseInt(req.query.page, 10) || 1; 
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;


        const query = {};
        const plans = await Plan.find(query)
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .lean();

        const totalPlans = await Plan.countDocuments(query);

        if (plans.length === 0) {
            return sendSuccess(res, {
                data: {
                    plans: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                },
                message: 'No available plans found for you to join.'
            }, 200);
        }

        const responsePlans = plans.map(plan => ({
            creatorName: plan.creatorName,
            category: plan.category,
            location: plan.location,
            date: plan.date,
            time: plan.time,
            createdAt: plan.createdAt,
            peopleCount: plan.people.length,
            peopleNames: plan.peopleNames || [],
            status: plan.status
        }));

        sendSuccess(res, {
            data: {
                plans: responsePlans,
                pagination: {
                    total: totalPlans,
                    page,
                    limit,
                    totalPages: Math.ceil(totalPlans / limit)
                }
            },
            message: 'Available plans retrieved successfully.'
        }, 200);
    } catch (error) {
        next(error); 
    }
};


module.exports = {
    createPlan,
    getAvailablePlans,
    insertMultiplePlans,
    getAllAvailablePlans
};

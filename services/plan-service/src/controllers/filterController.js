const Plan = require('../models/planModel');
const BadRequestError = require('../../../../shared/errors/BadRequestError');
const { sendSuccess, sendError } = require('../../../../shared/utils/responseHandler');
const axios = require('axios');


const getUserConnections = async (userId, authHeader) => {
    try {
       
        const friendsResponse = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}/friends`, {
            headers: { Authorization: authHeader }
        });
        const friendsData = friendsResponse.data.data.friends; 
        const friends = friendsData.map(friend => friend.id);

        
        const friendsOfFriendsResponse = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}/friends-of-friends`, {
            headers: { Authorization: authHeader }
        });

        const friendsOfFriendsData = friendsOfFriendsResponse.data.data.friendsOfFriends; 
        const friendsOfFriends = friendsOfFriendsData.map(fof => fof.id); 

        return { friends, friendsOfFriends };
    } catch (error) {
        console.error('Error fetching user connections:', error.message);
        throw new BadRequestError('Failed to fetch user connections.', { details: error.message });
    }
};

const filterPlans = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; 
        const userId = req.user.id; 

        const {
            people, 
            category, 
            subcategory, 
            location, 
            distance, 
            timelineStatus, 
            withinValue, 
            withinUnit, 
            afterValue, 
            afterUnit, 
            page = 1, 
            limit = 10 
        } = req.query;

        let query = {};

       
        if (people) {
            
            const peopleFilters = Array.isArray(people) ? people : [people];

            
            const allowedPeopleFilters = ['friends', 'friendsOfFriends', 'global'];
            for (const filter of peopleFilters) {
                if (!allowedPeopleFilters.includes(filter)) {
                    throw new BadRequestError(`Invalid value for 'people': ${filter}. Allowed values are ${allowedPeopleFilters.join(', ')}.`);
                }
            }

            const creatorIds = new Set(); 

            if (peopleFilters.includes('friends') || peopleFilters.includes('friendsOfFriends')) {
                const { friends, friendsOfFriends } = await getUserConnections(userId, authHeader);
                if (peopleFilters.includes('friends')) {
                    friends.forEach(id => creatorIds.add(id));
                }

                if (peopleFilters.includes('friendsOfFriends')) {
                    friendsOfFriends.forEach(id => creatorIds.add(id));
                }
            }

            
            if (!peopleFilters.includes('global')) {
                if (creatorIds.size > 0) {
                    query.createdBy = { $in: Array.from(creatorIds) };
                } else {
                    query.createdBy = { $in: [] };
                }
            }
        }

        
        if (location && distance) {
            let parsedLocation;
            try {
               
                parsedLocation = JSON.parse(location);
            } catch (err) {
                throw new BadRequestError('Location must be a valid JSON string.', { details: err.message });
            }

            const { lat, lng } = parsedLocation;

            if (
                lat === undefined || lng === undefined ||
                typeof lat !== 'number' || typeof lng !== 'number' ||
                isNaN(lat) || isNaN(lng) ||
                lat < -90 || lat > 90 ||
                lng < -180 || lng > 180
            ) {
                throw new BadRequestError('Invalid location coordinates. Latitude must be between -90 and 90 and longitude between -180 and 180.');
            }

            const distanceNum = Number(distance);
            if (isNaN(distanceNum) || distanceNum <= 0) {
                throw new BadRequestError('Distance must be a positive number.');
            }

            const distanceInMeters = distanceNum * 1000;

            query.location = {
                $geoWithin: {
                    $centerSphere: [[Number(lng), Number(lat)], distanceInMeters / 6378137] 
                }
            };
        } else if (location || distance) {
            
            throw new BadRequestError('Both location and distance parameters are required for geospatial filtering.');
        }

        
        if (category) {
            const categories = Array.isArray(category) ? category : [category];
            const allowedCategories = ['business', 'travel', 'socialize','shop']; 
            for (const cat of categories) {
                if (!allowedCategories.includes(cat)) {
                    throw new BadRequestError(`Invalid category: ${cat}. Allowed categories are ${allowedCategories.join(', ')}.`);
                }
            }
            query.category = { $in: categories };
        }

        
        if (subcategory) {
            const subcategories = Array.isArray(subcategory) ? subcategory : [subcategory];
           
            query.subcategory = { $in: subcategories };
        }

        
        if (timelineStatus) {
            const allowedTimelineStatuses = ['active', 'upcoming'];
            if (!allowedTimelineStatuses.includes(timelineStatus)) {
                throw new BadRequestError(`Invalid timelineStatus: ${timelineStatus}. Allowed values are ${allowedTimelineStatuses.join(', ')}.`);
            }

            const now = new Date();

            if (timelineStatus === 'active') {
                
                const today = now.toISOString().split('T')[0];
                query.date = { $eq: today };
            } else if (timelineStatus === 'upcoming') {
                
                let dateFilter = {};

                
                if (withinValue && withinUnit) {
                    const validUnits = ['days', 'weeks', 'months'];
                    if (!validUnits.includes(withinUnit)) {
                        throw new BadRequestError(`Invalid withinUnit: ${withinUnit}. Allowed units are ${validUnits.join(', ')}.`);
                    }

                    const withinNum = Number(withinValue);
                    if (isNaN(withinNum) || withinNum <= 0) {
                        throw new BadRequestError('withinValue must be a positive number.');
                    }

                    let endDate = new Date();
                    if (withinUnit === 'days') {
                        endDate.setDate(endDate.getDate() + withinNum);
                    } else if (withinUnit === 'weeks') {
                        endDate.setDate(endDate.getDate() + withinNum * 7);
                    } else if (withinUnit === 'months') {
                        endDate.setMonth(endDate.getMonth() + withinNum);
                    }

                    dateFilter.$lte = endDate;
                } else if (withinValue || withinUnit) {
                    throw new BadRequestError('Both withinValue and withinUnit are required for "within" timeline filter.');
                }

                if (afterValue && afterUnit) {
                    const validUnits = ['days', 'weeks', 'months'];
                    if (!validUnits.includes(afterUnit)) {
                        throw new BadRequestError(`Invalid afterUnit: ${afterUnit}. Allowed units are ${validUnits.join(', ')}.`);
                    }

                    const afterNum = Number(afterValue);
                    if (isNaN(afterNum) || afterNum <= 0) {
                        throw new BadRequestError('afterValue must be a positive number.');
                    }

                    let startDate = new Date();
                    if (afterUnit === 'days') {
                        startDate.setDate(startDate.getDate() + afterNum);
                    } else if (afterUnit === 'weeks') {
                        startDate.setDate(startDate.getDate() + afterNum * 7);
                    } else if (afterUnit === 'months') {
                        startDate.setMonth(startDate.getMonth() + afterNum);
                    }

                    dateFilter.$gte = startDate;
                } else if (afterValue || afterUnit) {
                    throw new BadRequestError('Both afterValue and afterUnit are required for "after" timeline filter.');
                }

                if (Object.keys(dateFilter).length > 0) {
                    query.date = { ...query.date, ...dateFilter };
                }
            }
        }

        const pageNum = Number(page);
        if (isNaN(pageNum) || pageNum <= 0 || !Number.isInteger(pageNum)) {
            throw new BadRequestError('Page must be a positive integer.');
        }

        const limitNum = Number(limit);
        if (isNaN(limitNum) || limitNum <= 0 || !Number.isInteger(limitNum)) {
            throw new BadRequestError('Limit must be a positive integer.');
        }

        const skip = (pageNum - 1) * limitNum;
        const perPage = limitNum;

        const [plans, totalPlans] = await Promise.all([
            Plan.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage)
                .lean(),
            Plan.countDocuments(query)
        ]);

        if (plans.length === 0) {
            return sendSuccess(res, {
                data: {
                    plans: [],
                    pagination: {
                        total: 0,
                        page: pageNum,
                        limit: perPage,
                        totalPages: 0
                    }
                },
                message: 'No plans found matching the applied filters.'
            }, 200);
        }

        const responsePlans = plans.map(plan => ({
            creatorName: plan.creatorName || 'Unknown',
            category: plan.category,
            subcategory: plan.subcategory || 'Other',
            location: {
                lat: plan.location.coordinates[1],
                lng: plan.location.coordinates[0]
            },
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
                    page: pageNum,
                    limit: perPage,
                    totalPages: Math.ceil(totalPlans / perPage)
                }
            },
            message: 'Plans retrieved successfully with applied filters.'
        }, 200);
    } catch (error) {
        if (error instanceof BadRequestError) {
            return sendError(res, {
                code: error.code || 'BAD_REQUEST',
                message: error.message,
                details: error.details || null
            }, 400);
        }

        console.error('Unexpected error in filterPlans:', error);
        return sendError(res, {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
            details: error.message
        }, 500);
    }
};

module.exports = {
    filterPlans
};

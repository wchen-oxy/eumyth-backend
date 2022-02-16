const selectModel = require('../models/modelServices');
const { doesContentExist } = require("../shared/helper");

const insertMany = (model, entries, ...conditions) => {
    return selectModel(model).insertMany(entries, ...conditions)
}

const find = (model, options) => (
    selectModel(model).find({ ...options })
        .then(
            result => {
                doesContentExist(result);
                return result;
            }
        ))

const limitFind = (model, options, requestLimit) => (
    selectModel(model).find({ ...options })
        .limit(requestLimit)
        .then(
            result => {
                doesContentExist(result);
                return result;
            }
        )
)

const findByID = (model, ID) => (
    selectModel(model).findById(ID)
        .then(result => {
            doesContentExist(result);
            return result;
        }));


const findOne = (model, criteria) => (
    selectModel(model).findOne(criteria)
        .then(result => {
            doesContentExist(result);
            return result;
        }));

const findByIDAndUpdate = (model, ID, update) => (
    selectModel(model).findByIdAndUpdate(ID, update)
);

const findManyAndUpdate = (model, criteria, update) => (
    selectModel(model).updateMany(
        criteria,
        update
    ))

const findManyByID = (model, IDList, isOrganized) => {
    if (isOrganized) {
        return selectModel(model).find({
            '_id': { $in: IDList }, function(error, docs) {
                if (error) console.log(error);
                else {
                    console.log(docs);
                }
            }
        }).sort({ createdAt: -1 }).lean();
    }
    else {
        return selectModel(model).find({
            '_id': { $in: IDList }, function(error, docs) {
                if (error) console.log(error);
                else {
                    console.log(docs);
                }
            }
        })
    }
}

const deleteOne = (model, attributes) => {
    selectModel(model).deleteOne(attributes,
        (err, result) => {
            console.log
            if (err) {
                console.log(err);
                throw new Error(500, err);
            }
            return result;
        })
}
const deleteByID = (model, ID) => (
    selectModel(model).deleteOne({ _id: ID },
        (err, result) => {
            console.log
            if (err) {
                console.log(err);
                throw new Error(500, err);
            }
            return result;
        }))


const deleteManyByID = (model, IDArray) => (
    selectModel(model).deleteMany({
        _id: {
            $in: IDArray
        }
    },
        (err, result) => {
            if (err) {
                console.log(err);
                throw new Error(500, err);
            }
            return result;

        }))


module.exports = {
    insertMany,
    limitFind,
    find,
    findByID,
    findOne,
    findByIDAndUpdate,
    findManyAndUpdate,
    findManyByID,
    deleteByID,
    deleteManyByID,
    deleteOne,
}


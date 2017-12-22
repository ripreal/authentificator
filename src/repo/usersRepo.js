const AWS = require("aws-sdk");
const userSettings = require('../../userSettings.json');
const TABLE_NAME = process.env.USERS_TABLE || 'UsersTable';
const objectHash = require('object-hash');
const APP_PROFILES = require('../constants/appProfiles');

class UsersRepo {

    constructor(profile) {

        if (profile == APP_PROFILES.TEST) {
            AWS.config = new AWS.Config();
            AWS.config.accessKeyId = userSettings.AWS.ACCESS_KEY_ID;
            AWS.config.secretAccessKey = userSettings.AWS.SECRET_ACCESS_KEY;
            AWS.config.region = userSettings.REGION;
            AWS.config.endpoint = userSettings.DYNAMO_DB.SERVER;
        }

        this._dynamodb = new AWS.DynamoDB();
        this._docClient = new AWS.DynamoDB.DocumentClient();
    }

    async put(userData)  {
        let user = userData;
        user.token = objectHash(user.email);
        try {
            let params = {
                TableName: TABLE_NAME,
                Item: user
            };
            await this._docClient.put(params).promise();
        } catch (error) {
            throw new Error(error);
        }
        return user;
    }

    async get(email) {
        
        let params = {
            TableName: TABLE_NAME,
            Key: {token: objectHash(email)},
        };
        let item = null;
        try {
            let result = await this._docClient.get(params).promise();
            item = result.Item;
        } catch (error) {
            throw new Error(error);
        }
        
        return item;
    }

    async delete(email) {
        var params = {
            TableName: TABLE_NAME,
            Key: {token: objectHash(email)}
        };
        try {
            await this._docClient.delete(params).promise();
        } catch(error) {
            throw new Error(error);
        }
    }

    async list() {
        var params = {
            TableName : TABLE_NAME,
        };
        let result = [];
        try {
            let result = await this._docClient.scan(params).promise()
        } catch(error) {
            throw new Error(error);
        }
        return result;
    }

    async deleteUsersTable() {
        let params = {
            TableName : TABLE_NAME
        };
        try {
            await this._dynamodb.deleteTable(params).promise();
        } catch (error) {
            throw new Error(error);
        }
    }

    async createSheme() {

        let params = {
            TableName : TABLE_NAME,
            KeySchema: [
                { AttributeName: "token", KeyType: "HASH"},  //Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: "token", AttributeType: "S" }
            ],
            ProvisionedThroughput: {       
                ReadCapacityUnits: 10, 
                WriteCapacityUnits: 10
            }
        };

        try {
            await this._dynamodb.createTable(params).promise();
        } catch (error) {
            throw new Error(error);
        }
    }

}

module.exports = UsersRepo;
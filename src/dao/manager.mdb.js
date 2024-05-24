import { MongoClient, ObjectId } from 'mongodb';

class DBManager {
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
        this.client = new MongoClient(uri);
        this.db = null;
        this.collection = null;
    }

    async connect() {
        if (!this.client.topology || !this.client.topology.isConnected()) {
            await this.client.connect();
        }
        this.db = this.client.db(this.dbName);
        this.collection = this.db.collection('products');
    }

    async disconnect() {
        if (this.client && this.client.topology && this.client.topology.isConnected()) {
            await this.client.close();
        }
    }

    async getAll(limit = 50) {
        try {
            await this.connect();
            const products = await this.collection.find().limit(limit).toArray();
            return products;
        } catch (err) {
            return { error: err.message };
        } finally {
            await this.disconnect();
        }
    }

    async add(newData) {
        try {
            await this.connect();
            const now = new Date();
            const newProduct = {
                ...newData,
                createdAt: now,
                updatedAt: now
            };
            const result = await this.collection.insertOne(newProduct);
            newProduct._id = result.insertedId;
            return newProduct;
        } catch (err) {
            return { error: err.message };
        } finally {
            await this.disconnect();
        }
    }

    async getById(id) {
        try {
            await this.connect();
            const product = await this.collection.findOne({ _id: new ObjectId(id) });
            return product;
        } catch (err) {
            return { error: err.message };
        } finally {
            await this.disconnect();
        }
    }

    async update(id, updProd) {
        try {
            await this.connect();
            const now = new Date();
            const updatedProduct = {
                ...updProd,
                updatedAt: now
            };
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedProduct }
            );
            return result.modifiedCount > 0 ? updatedProduct : null;
        } catch (err) {
            return { error: err.message };
        } finally {
            await this.disconnect();
        }
    }

    async delete(idDelete) {
        try {
            await this.connect();
            const result = await this.collection.deleteOne({ _id: new ObjectId(idDelete) });
            return result.deletedCount > 0;
        } catch (err) {
            return { error: err.message };
        } finally {
            await this.disconnect();
        }
    }
}

export default DBManager;
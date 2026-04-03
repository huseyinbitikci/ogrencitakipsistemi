// Base Repository - Tüm repository'ler için temel CRUD işlemleri
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll(filter = {}, options = {}) {
        try {
            const { sort = {}, limit, skip, select } = options;
            let query = this.model.find(filter);
            
            if (sort) query = query.sort(sort);
            if (limit) query = query.limit(limit);
            if (skip) query = query.skip(skip);
            if (select) query = query.select(select);
            
            return await query.exec();
        } catch (error) {
            throw new Error(`FindAll error: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            throw new Error(`FindById error: ${error.message}`);
        }
    }

    async findOne(filter) {
        try {
            return await this.model.findOne(filter);
        } catch (error) {
            throw new Error(`FindOne error: ${error.message}`);
        }
    }

    async create(data) {
        try {
            const document = new this.model(data);
            return await document.save();
        } catch (error) {
            throw new Error(`Create error: ${error.message}`);
        }
    }

    async update(id, data) {
        try {
            return await this.model.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Update error: ${error.message}`);
        }
    }

    async updateOne(filter, data) {
        try {
            return await this.model.findOneAndUpdate(
                filter,
                data,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`UpdateOne error: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Delete error: ${error.message}`);
        }
    }

    async deleteOne(filter) {
        try {
            return await this.model.findOneAndDelete(filter);
        } catch (error) {
            throw new Error(`DeleteOne error: ${error.message}`);
        }
    }

    async deleteMany(filter) {
        try {
            return await this.model.deleteMany(filter);
        } catch (error) {
            throw new Error(`DeleteMany error: ${error.message}`);
        }
    }

    async count(filter = {}) {
        try {
            return await this.model.countDocuments(filter);
        } catch (error) {
            throw new Error(`Count error: ${error.message}`);
        }
    }

    async exists(filter) {
        try {
            const count = await this.model.countDocuments(filter).limit(1);
            return count > 0;
        } catch (error) {
            throw new Error(`Exists error: ${error.message}`);
        }
    }
}

module.exports = BaseRepository;

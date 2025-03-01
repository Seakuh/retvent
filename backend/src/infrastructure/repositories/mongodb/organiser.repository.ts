import { Model } from "mongoose";
import { CreateOrganiserDto } from "src/presentation/dtos/create-organiser.dto";
import { Organiser } from "../../schemas/organiser.schema";

export class MongoOrganiserRepository  {
    constructor(private readonly organiserModel: Model<Organiser>) {}
    async findByHost(host: string) {
        return this.organiserModel.find({ host });
    }
    

    async create(createOrganiserDto: CreateOrganiserDto): Promise<Organiser> {
        const organiser = new this.organiserModel(createOrganiserDto);
        return organiser.save();
    }   

    async edit(id: string, updateOrganiserDto: CreateOrganiserDto): Promise<Organiser> {
        return this.organiserModel.findByIdAndUpdate(id, updateOrganiserDto, { new: true });
    }

    async findById(id: string): Promise<Organiser> {
        return this.organiserModel.findById(id);
    }

    async findAll(): Promise<Organiser[]> {
        return this.organiserModel.find();
    }
    
    
    
}   
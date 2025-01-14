import mongoose, {model} from "mongoose";

type RequestMeta = {
    IP: string;
    URL: string;
    date: Date
}

const requestMetaSchema = new mongoose.Schema<RequestMeta>({
    IP: {type: String, required: true},
    URL: {type: String, required: true},
    date: {type: Date, required: true}
})

export const RequestMetaModel = model<RequestMeta>("Request-logs", requestMetaSchema);
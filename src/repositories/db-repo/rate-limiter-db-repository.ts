import {sub} from "date-fns";
import {RequestInfoDTO} from "../../types/DTO-types";
import {RequestMetaModel} from "../../routes/auth/request-meta.entity";

export const rateLimiterRepository = {
    async countDocumentsByIpUrlAndDate(requestInfoDTO: RequestInfoDTO) {
        return RequestMetaModel.countDocuments(
            {
                IP: requestInfoDTO.IP,
                URL: requestInfoDTO.URL,
                date: {$gte: sub(new Date(), {seconds: 10})}
            }
        )
    },

    async saveAppeal(requestInfoDTO: RequestInfoDTO) {
        await RequestMetaModel.create(requestInfoDTO);
    }
}
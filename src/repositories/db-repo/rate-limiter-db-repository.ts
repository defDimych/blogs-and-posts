import {requestLogCollection} from "../db";
import {sub} from "date-fns";
import {RequestInfoDTO} from "../../types/DTO-types";

export const rateLimiterRepository = {
    async countDocumentsByIpUrlAndDate(requestInfoDTO: RequestInfoDTO) {
        return await requestLogCollection.countDocuments(
            {
                IP: requestInfoDTO.IP,
                URL: requestInfoDTO.URL,
                date: {$gte: sub(new Date(), {seconds: 10})}
            }
        )
    },

    async saveAppeal(requestInfoDTO: RequestInfoDTO) {
        await requestLogCollection.insertOne(requestInfoDTO);
    }
}
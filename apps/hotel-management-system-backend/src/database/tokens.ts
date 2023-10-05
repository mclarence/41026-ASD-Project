import {IDatabase} from "pg-promise";
import queries from "./sql/queries";

export interface ITokenRevocationListDAO {
    revokeToken: (token: string) => Promise<void>,
    checkTokenRevoked: (token: string) => Promise<boolean>
}

const makeTokenRevocationListDAO = (db: IDatabase<any, any>): ITokenRevocationListDAO => {
    const revokeToken = async (token: string): Promise<void> => {
        const now = new Date();
        await db.none(queries.tokenRevocationList.revokeToken, [token, now]);
    }

    const checkTokenRevoked = async (token: string): Promise<boolean> => {
        const tokenRevocationList: any = await db.oneOrNone(queries.tokenRevocationList.checkTokenRevoked, [token]);
        if (tokenRevocationList === null) {
            return false;
        }
        return true;
    }

    return {
        revokeToken,
        checkTokenRevoked
    }
}

export default makeTokenRevocationListDAO;
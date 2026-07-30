import { findActiveBranches } from "./branches.repository.js";

export const getBranches = async () => {
    const branches = await findActiveBranches();

    return branches.map((branch) => ({
        _id: branch._id.toString(),
        name: branch.name
    }));
};
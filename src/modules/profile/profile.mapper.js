import { buildFileUrl } from "../../common/utils/fileUrl.js";

export const toProfileResponse = (req, user) => {
    if (!user) return null;

    return {
        id: user._id.toString(),
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        jobTitle: user.jobTitle,

        branch: user.branch
            ? {
                id: user.branch._id.toString(),
                name: user.branch.name
            }
            : null,

        service: user.service
            ? {
                id: user.service._id.toString(),
                name: user.service.name
            }
            : null,

        counterNumber: user.counterNumber,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        lastLogin: user.lastLogin,
        profileImage: buildFileUrl(req, user.profileImage),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
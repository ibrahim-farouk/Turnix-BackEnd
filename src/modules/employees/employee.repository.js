import { User } from "../../models/index.js";

export const findEmployees = async (
    filter,
    skip,
    limit
) => {
    return await User.find(filter)
        .select("-password")
        .populate("branch", "name")
        .populate("service", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
}

export const countEmployees = async (filter) => {
    return await User.countDocuments(filter);
}

export const findById = async (id) => {
    return await User.findById(id)
        .select("-password")
        .populate("branch", "name")
        .populate("service", "name")
}

export const findByEmail = async (email) => {
    return await User.findOne(
        {
            email: email.toLowerCase()
        }
    );
}

export const findByPhone = async (phone) => {
    return await User.findOne(
        {
            phone: phone
        }
    );
}

export const findByBranchAndService = async (
    branchId,
    serviceId,
    excludeEmployeeId = null
) => {
    const query = {
        role: "EMPLOYEE",
        branch: branchId,
        service: serviceId,
        status: "ACTIVE",
    };

    if (excludeEmployeeId) {
        query._id = { $ne: excludeEmployeeId }; // Exclude the employee with the specified ID
    }

    return await User.findOne(query);
}

export const createEmployee = async (employeeData) => {
    const employee = await User.create(employeeData);
    const employeeObject = employee.toObject();
    delete employeeObject.password;
    return employeeObject;
}
export const updateEmployee = async (id, updateData) => {
    return await User.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true // used to validate the update data 
        }
    )
        .select("-password")
        .populate("branch", "name")
        .populate("service", "name");
}

export const deactivateEmployee = async (id) => {
    return await User.findByIdAndUpdate(
        id,
        { status: "INACTIVE" },
        { new: true }
    ).select("-password");
}

export const updatePassword = async (
    id,
    hashedPassword
) => {
    return await User.findByIdAndUpdate(
        id,
        { password: hashedPassword, mustChangePassword: true },
        { new: true }
    ).select("-password");
}

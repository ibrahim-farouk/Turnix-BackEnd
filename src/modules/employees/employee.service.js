import bcrypt from "bcryptjs";

import * as employeeRepository from "./employee.repository.js";
import * as branchRepository from "../branches/branches.repository.js";
import * as serviceRepository from "../services/service.repository.js";
import * as counterRepository from "../counter/counter.repository.js";

import AppError from "../../common/errors/app-error.js";
import { ERROR_CODES, USER_ROLES, USER_STATUS } from "../../common/utils/constants.js";


const generateEmployeeId = async () => {
    const counter = await counterRepository.getNextSequence("employee");
    const employeeId = `EMP-${counter.toString().padStart(3, "0")}`;
    return employeeId;
};

export const getEmployees = async (query) => {

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {
        role: USER_ROLES.EMPLOYEE,
    }
    if (query.status) {
        filter.status = query.status;
    }
    if (query.branch) {
        filter.branch = query.branch;
    }
    if (query.search) {
        filter.$or = [
            { fullName: { $regex: query.search, $options: "i" } },
            { employeeId: { $regex: query.search, $options: "i" } },
        ];
    }
    const [employees, total] = await Promise.all([
        employeeRepository.findEmployees(filter, skip, limit),
        employeeRepository.countEmployees(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        employees,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

export const createEmployee = async (employeeData) => {
    const existEmail = await employeeRepository.findByEmail(employeeData.email);

    if (existEmail) {
        throw new AppError(
            "Email already exists",
            400,
            ERROR_CODES.EMAIL_ALREADY_EXISTS
        );
    }

    const existPhone = await employeeRepository.findByPhone(employeeData.phone);

    if (existPhone) {
        throw new AppError(
            "Phone already exists",
            400,
            ERROR_CODES.PHONE_ALREADY_EXISTS
        );
    }

    const branch = await branchRepository.findById(employeeData.branchId);

    if (!branch) {
        throw new AppError(
            "Branch not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }

    if (!branch.isActive) {
        throw new AppError(
            "Branch is not active",
            400,
            ERROR_CODES.VALIDATION_ERROR
        );
    }

    const service = await serviceRepository.findById(employeeData.serviceId);

    if (!service) {
        throw new AppError(
            "Service not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }

    if (service.branch.toString() !== branch._id.toString()) {
        throw new AppError(
            "Service does not belong to the branch",
            400,
            ERROR_CODES.VALIDATION_ERROR
        );
    }

    const assignEmployee = await employeeRepository.findByBranchAndService(branch._id, service._id);

    if (assignEmployee) {
        throw new AppError(
            "Employee already assigned to service",
            409,
            ERROR_CODES.CONFLICT
        );
    }

    const employeeId = await generateEmployeeId();

    const hashedPassword = await bcrypt.hash(employeeData.password, 12);

    const employee = await employeeRepository.createEmployee({
        employeeId,
        fullName: employeeData.fullName,
        jobTitle: employeeData.jobTitle,
        email: employeeData.email.toLowerCase(),
        phone: employeeData.phone,
        password: hashedPassword,
        role: USER_ROLES.EMPLOYEE,
        branch: branch._id,
        service: service._id,
        counterNumber: employeeData.counterNumber,
        status: USER_STATUS.ACTIVE,
        mustChangePassword: false
    });

    return employee;
}

export const getEmployee = async (id) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
        throw new AppError(
            "Employee not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }
    if (employee.role !== USER_ROLES.EMPLOYEE) {
        throw new AppError(
            "Employee not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }
    return employee;
}

export const updateEmployee = async (id, updateData) => {
    const employee = await employeeRepository.findById(id);
    if (!employee || employee.role !== USER_ROLES.EMPLOYEE) {
        throw new AppError(
            "Employee not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }
    const isBranchChanged = !!updateData.branchId;
    const isServiceChanged = !!updateData.serviceId;
    if (isBranchChanged || isServiceChanged) {
        const finalBranchId =
            updateData.branchId ||
            employee.branch.toString();
        const finalServiceId =
            updateData.serviceId ||
            employee.service.toString();
        if (finalBranchId) {
            const branch = await branchRepository.findById(finalBranchId);
            if (!branch) {
                throw new AppError(
                    "Branch not found",
                    404,
                    ERROR_CODES.NOT_FOUND
                );
            }
            if (!branch.isActive) {
                throw new AppError(
                    "Branch is not active",
                    400,
                    ERROR_CODES.VALIDATION_ERROR
                );
            }
        }
        if (finalServiceId) {
            const service = await serviceRepository.findById(finalServiceId);
            if (!service) {
                throw new AppError(
                    "Service not found",
                    404,
                    ERROR_CODES.NOT_FOUND
                );
            }
            const branchId = updateData.branchId || employee.branch.toString();
            if (service.branch.toString() !== branchId) {
                throw new AppError(
                    "Service does not belong to the branch",
                    400,
                    ERROR_CODES.VALIDATION_ERROR
                );
            }
            const assignedEmployee = await employeeRepository.findByBranchAndService(branchId, service._id, employee._id);
            if (assignedEmployee) {
                throw new AppError(
                    "Employee already assigned to service",
                    409,
                    ERROR_CODES.CONFLICT
                );
            }
        }
    }
    const updateFields = {};
    if (updateData.fullName)
        updateFields.fullName = updateData.fullName;
    if (updateData.phone)
        updateFields.phone = updateData.phone;
    if (updateData.branchId)
        updateFields.branch = updateData.branchId;
    if (updateData.serviceId)
        updateFields.service = updateData.serviceId;
    if (updateData.counterNumber !== undefined)
        updateFields.counterNumber =
            updateData.counterNumber;
    if (updateData.status)
        updateFields.status = updateData.status;
    return employeeRepository.updateEmployee(
        id,
        updateFields
    );
}

export const deleteEmployee = async (id) => {
    const employee = await employeeRepository.findById(id);
    if (!employee || employee.role !== USER_ROLES.EMPLOYEE) {
        throw new AppError(
            "Employee not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }
    return employeeRepository.deactivateEmployee(id);
}

export const resetEmployeePassword = async (id, newPassword) => {
    const employee = await employeeRepository.findById(id);
    if (!employee || employee.role !== USER_ROLES.EMPLOYEE) {
        throw new AppError(
            "Employee not found",
            404,
            ERROR_CODES.NOT_FOUND
        );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await employeeRepository.updatePassword(id, hashedPassword);
    return;
}
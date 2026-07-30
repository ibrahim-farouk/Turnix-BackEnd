import bcrypt from "bcryptjs";

import { connectMongo, disconnectMongo } from "./mongo.js";
import {
    User,
    Branch,
    Service,
    Setting
} from "../models/index.js";

import { env } from "../config/env.js";

const seedAdminEmail = env.seedAdminEmail;
const seedAdminPassword = env.seedAdminPassword;
const seedEmployeeEmail = env.seedEmployeeEmail;
const seedEmployeePassword = env.seedEmployeePassword;

const seed = async () => {
    try {
        // Validate seed configuration
        if (
            !seedAdminEmail ||
            !seedAdminPassword ||
            !seedEmployeeEmail ||
            !seedEmployeePassword
        ) {
            throw new Error(
                "Seed credentials are missing from environment variables"
            );
        }

        await connectMongo();

        console.log("MongoDB connected");

        // 1- settings 
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({
                defaultServiceTime: 15
            });
            console.log("Settings created");
        } else {
            console.log("Settings already exist");
        }

        // 2- branch
        const branch = await Branch.findOneAndUpdate(
            { name: "Mansoura" },
            {
                $setOnInsert: {
                    name: "Mansoura",
                    isActive: true
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        if (!branch) {
            throw new Error("Failed to create or find Mansoura branch");
        }

        console.log("Mansoura branch ready");

        // 3- service
        const servicesData = [
            { name: "Dentistry", prefix: "A" },
            { name: "Internal Medicine", prefix: "B" },
            { name: "ENT", prefix: "C" },
            { name: "Ophthalmology", prefix: "D" },
            { name: "Pediatrics", prefix: "E" }
        ];
        const services = {};
        for (const serviceData of servicesData) {
            const service = await Service.findOneAndUpdate(
                {
                    branch: branch._id,
                    name: serviceData.name
                },
                {
                    $setOnInsert: { // if not found then insert
                        name: serviceData.name,
                        prefix: serviceData.prefix,
                        branch: branch._id,
                        lastTicketNumber: 100,
                        isActive: true
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );
            if (!service) {
                throw new Error(
                    `Failed to create or find service: ${serviceData.name}`
                );
            }
            services[serviceData.name] = service;
            console.log(`${serviceData.name} service ready`);
        }

        // 4- admin
        let admin = await User.findOne({
            email: seedAdminEmail.toLowerCase()
        });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(seedAdminPassword, 12);
            admin = await User.create({
                employeeId: "ADM-001",
                fullName: "Admin",
                jobTitle: "System Administrator",
                email: seedAdminEmail.toLowerCase(),
                phone: "01012345678",
                password: hashedPassword,
                role: "ADMIN",
                branch: null,
                service: null,
                status: "ACTIVE",
            });
            console.log("Admin created");
        } else {
            console.log("Admin already exist");
        }

        // 5- employee
        let employee = await User.findOne({
            email: seedEmployeeEmail.toLowerCase()
        });
        if (!employee) {
            const hashedPassword = await bcrypt.hash(seedEmployeePassword, 12);
            employee = await User.create({
                employeeId: "EMP-001",
                fullName: "Dentistry Employee 1",
                jobTitle: "Dentistry Service Agent",
                email: seedEmployeeEmail.toLowerCase(),
                phone: "01012345679",
                password: hashedPassword,
                role: "EMPLOYEE",
                branch: branch._id,
                service: services.Dentistry._id,
                counterNumber: 1,
                status: "ACTIVE",
            });
            console.log("Employee created");
        } else {
            employee.branch = branch._id;
            employee.service = services.Dentistry._id;
            employee.counterNumber = 1;
            employee.status = "ACTIVE";
            await employee.save();
            console.log("Employee already exists and assignment updated");
        }
        console.log("Seed completed successfully");

    } catch (error) {
        console.error("Seed failed", error.message);
        process.exitCode = 1;
    } finally {
        await disconnectMongo();
    }
};
seed();
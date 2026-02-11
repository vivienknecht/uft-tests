#!/usr/bin/env node
"use strict";
/*
 * Copyright 2016-2025 Open Text.
 *
 * The only warranties for products and services of Open Text and
 * its affiliates and licensors (“Open Text”) are as may be set forth
 * in the express warranty statements accompanying such products and services.
 * Nothing herein should be construed as constituting an additional warranty.
 * Open Text shall not be liable for technical or editorial errors or
 * omissions contained herein. The information contained herein is subject
 * to change without notice.
 *
 * Except as specifically indicated otherwise, this document contains
 * confidential information and a valid license is required for possession,
 * use or copying. If this work is provided to the U.S. Government,
 * consistent with FAR 12.211 and 12.212, Commercial Computer Software,
 * Computer Software Documentation, and Technical Data for Commercial Items are
 * licensed to the U.S. Government under vendor's standard commercial license.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = require("yargs");
const helpers_1 = require("yargs/helpers");
const logger_1 = require("./utils/logger");
const config_1 = require("./config/config");
const Discovery_1 = require("./discovery/Discovery");
const utils_1 = require("./utils/utils");
const index_1 = require("./index");
const LOGGER = new logger_1.default("main.ts");
let args;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    loadArguments();
    (0, config_1.initConfig)(args);
    const actionType = args.action;
    const isFullScan = args.isFullScan;
    const path = args.path;
    const octaneUrl = args.octaneUrl;
    const sharedSpace = args.sharedSpace;
    const workspace = args.workspace;
    const clientId = args.clientId;
    const clientSecret = args.clientSecret;
    if (!actionType) {
        throw new Error("Action type is required. Please specify whether you want to convert tests or discover tests.");
    }
    if (actionType === "convertTests") {
        const framework = (0, config_1.getConfig)().framework;
        const rootDirectory = process.env.BUILD_SOURCESDIRECTORY || process.env.GITHUB_WORKSPACE || process.env.CI_PROJECT_DIR || "";
        const convertedTests = (0, index_1.convertTests)(args.testsToRun, framework, rootDirectory);
        if (convertedTests) {
            console.log(convertedTests);
        }
        return convertedTests;
    }
    else if (actionType === "discoverTests") {
        LOGGER.info("The path is: " + path);
        yield (0, utils_1.verifyPath)(path);
        if (!path ||
            (isFullScan === undefined) ||
            !octaneUrl ||
            !sharedSpace ||
            !workspace ||
            !clientId ||
            !clientSecret) {
            throw new Error("You have to specify all Octane connection parameters, the path to the repository to discover UFT tests from and whether full scan or sync is required.");
        }
        yield discoverTests(path, isFullScan, octaneUrl, sharedSpace, workspace, clientId, clientSecret);
    }
});
const discoverTests = (path, isFullScan, octaneUrl, sharedSpace, workspace, clientId, clientSecret) => __awaiter(void 0, void 0, void 0, function* () {
    const discovery = new Discovery_1.default(isFullScan, octaneUrl, sharedSpace, workspace, clientId, clientSecret);
    yield discovery.startDiscovery(path);
});
const loadArguments = () => {
    args = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
        .option("framework", {
        type: "string",
        demandOption: false,
        describe: "Specify the framework",
    })
        .option("testsToRun", {
        type: "string",
        demandOption: false,
        describe: "Specify the tests to run",
    })
        .option("customFramework", {
        type: "string",
        default: "",
        describe: "JSON object containing the format rules used for conversion",
    })
        .option("logLevel", {
        type: "number",
        default: 0,
        describe: "Set the log level (1-5)",
    })
        .option("action", {
        type: "string",
        demandOption: true,
        default: "convertTests",
        describe: "Specify the action you want to execute, convertTests or discoverTests",
    })
        .option("isFullScan", {
        type: "boolean",
        demandOption: false,
        describe: "Specify whether full scan or sync is required",
    })
        .option("path", {
        type: "string",
        default: "Specify the path to the repository to discover UFT tests from",
    })
        .option("octaneUrl", {
        type: "string",
        default: "",
        describe: "Specify the Octane server URL",
    })
        .option("sharedSpace", {
        type: "string",
        default: "",
        describe: "Specify the Octane shared space id",
    })
        .option("workspace", {
        type: "string",
        default: "",
        describe: "Specify the Octane workspace id",
    })
        .option("clientId", {
        type: "string",
        default: "",
        describe: "Specify the Octane client id",
    })
        .option("clientSecret", {
        type: "string",
        default: "",
        describe: "Specify the Octane client secret",
    })
        .parseSync();
};
main();

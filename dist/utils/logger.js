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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config/config");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DISABLED"] = 0] = "DISABLED";
    LogLevel[LogLevel["TRACE"] = 1] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["WARN"] = 4] = "WARN";
    LogLevel[LogLevel["ERROR"] = 5] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor(module) {
        this.levels = {
            1: { value: 1, display: "TRACE" },
            2: { value: 2, display: "DEBUG" },
            3: { value: 3, display: "INFO" },
            4: { value: 4, display: "WARNING" },
            5: { value: 5, display: "ERROR" },
        };
        this.module = module;
    }
    trace(message) {
        this.log(LogLevel.TRACE, message);
    }
    debug(message) {
        this.log(LogLevel.DEBUG, message);
    }
    info(message) {
        this.log(LogLevel.INFO, message);
    }
    warn(message) {
        this.log(LogLevel.WARN, message);
    }
    error(message) {
        this.log(LogLevel.ERROR, message);
    }
    /**
     * Log a message at a certain logging level.
     *
     * @param logLevel Level to log at
     * @param message Message to log
     */
    log(logLevel, message) {
        const minLevel = (0, config_1.getConfig)().logLevel;
        const level = this.getLevel(logLevel);
        if (!level || minLevel === LogLevel.DISABLED || level.value < minLevel)
            return;
        this.emit(level.display, message);
    }
    /**
     * Converts a string level (trace/debug/info/warn/error) into a number and display value
     *
     * @param minLevel
     */
    getLevel(minLevel) {
        if (minLevel in this.levels)
            return this.levels[minLevel];
        else
            return undefined;
    }
    /**
     * Emits a log message.
     *
     * @param logLevelPrefix Display name of the log level
     * @param message Message to log
     */
    emit(logLevelPrefix, message) {
        console.log(`[${logLevelPrefix}][${this.module}] ${message}`);
    }
}
exports.default = Logger;

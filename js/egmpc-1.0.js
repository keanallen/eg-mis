/**!
 * Eternal Gardens -  Javascript Helper Library v1.0
 * https://eternalgardens.ph
 * 
 * Copyright  Eternal Gardens - MIS Team
 */

var EGMPC = {

    checkParams: function (args) {
        const actual = args.length;
        const expected = args.callee.length;
        if (actual !== expected)
            throw new Error(`Wrong number of parameters passed to a function!\nexpected: ${expected}, passed: ${actual}`);
    },
    forms: {
        errors: 0,
        validateEmail: function (email) {
            /**
             * This will validate email address
             * Return true if email string is valid
             */
            this.errors = 0;
            const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var result = regex.test(String(email).toLowerCase());
            if (!result) {
                this.errors++;
            }
            return result;
        },
        resetFileInput: function (element) {
            /**
             * This will clear the file input field
             * Usage:
             * var target = document.getElementById("myFile");
             * EGMPC.resetFileInput(target);
             */
            element[0].setAttribute('type', 'text');
            element[0].setAttribute('type', 'file');

        },
        validateInputFile: function (element, allowed_extension, max_file_size) {
            /**
             * Usage
             * var file = EGMPC.forms.validateInputFile(....);
             * console.log(file) to see result
             */
            // reset errors
            this.errors = 0;
            if (!element) {
                this.errors++;
                return { "result": "Please choose a file" };
            }
            // Check if parameters passed are exactly the same
            EGMPC.checkParams(arguments);
            if (element[0].type !== "file") {
                this.errors++;
                this.resetFileInput(element);
                return { "result": "EGMPC.validateFile() is only applicable on file inputs" };
            }
            var file = element[0];
            if (!file.files.length) {
                this.errors++;
                return { "result": "Please select a file to upload" };
            }

            var the_file = file.files[0],
                path = file.value,
                ext = the_file.type.split('/').pop(),
                size = the_file.size,
                readable_size = "";

            var max_size = 0,
                base = 0,
                multiplier = 0,
                unit = "mb";


            // Allowed Extension Validation
            if (!allowed_extension.length) {
                this.errors++;
                this.resetFileInput(element);
                return { "result": "Please specify the allowed extension in an array form" };
            }
            // Check if file extension is allowed
            if (allowed_extension.indexOf(ext) < 0) {
                this.errors++;
                this.resetFileInput(element);
                return { "result": `Invalid file type. You can only upload ${allowed_extension.join()} files` };
            }
            // File Size Validation
            if (max_file_size.indexOf("kb") > -1) {
                var base = max_file_size.replace('kb', '');
                base = parseFloat(base);
                multiplier = 1;
                unit = "kb";
            } else if (max_file_size.indexOf("mb") > -1) {
                var base = max_file_size.replace('mb', '');
                base = parseFloat(base);
                multiplier = 2;
            } else {
                base = 10;
                multiplier = 2;
                this.errors++;
                this.resetFileInput(element);
                return { "result": "You can only upload from kb to mb" };
            }

            max_size = base * Math.pow(1000, multiplier);
            readable_size = ((size) / (multiplier * 1000)).toFixed(2).toString() + unit;
            if (parseFloat(size) > parseFloat(max_size)) {
                this.errors++;
                this.resetFileInput(element);
                return { "result": `You can only upload up to ${max_file_size}` };
            }

            // If no errors, this is the response
            return { "result": "Success", "filepath": path, "filesize": readable_size, "filetype": the_file.type, "fileextension": ext };

        },
        showRequiredField: function () {
            /**
             * Will display (*) on each label tag
             */
            var fields = document.querySelectorAll("[egmpc-required]");
            if (!fields) {
                return;
            }
            fields.forEach(element => {
                // Try to add asterisk (*) if label tag found
                const only = ['LABEL'];
                const showOn = [element.id.trim(), element.name.trim()];
                let prev = element.previousElementSibling;
                let next = element.nextElementSibling;

                if (prev) {
                    let prevReference = prev.getAttribute('for');
                    if (prevReference) {
                        if (showOn.indexOf(prevReference) > -1) {
                            if (only.indexOf(prev.tagName) > -1) {
                                prev.insertAdjacentHTML('afterbegin', `<small style='color:red' title='This field is required'>*&nbsp;</small>`);
                            }
                        }
                    }

                }
                if (next) {
                    let nextReference = next.getAttribute('for');
                    if (nextReference) {
                        if (showOn.indexOf(nextReference) > -1) {
                            if (only.indexOf(next.tagName) > -1)
                                next.insertAdjacentHTML('beforeend', `<small style='color:red'>&nbsp;*</small>`);
                        }
                    }
                }
            });
        },
        validateInputField: function () {
            /**
             * Check for "egmpc-required" attribute on HTML Element
             * and if it found, then this field must not be empty
             */
            var hasRequired = document.querySelectorAll("[egmpc-required]");
            if (hasRequired) {
                var result = { "result": "Success" };
                this.errors = 0;
                // Check for input type number or text
                hasRequired.forEach(element => {

                    if (result.result !== "Success") {

                        return;
                    }
                    var fieldlabel = element.getAttribute('egmpc-required');
                    if (element.type == "text") {
                        if (element.value.trim() == "") {
                            this.errors++;
                            result = { "result": `${fieldlabel} is required` };
                        }
                    } else if (element.type == "number") {
                        if (element.value <= 0) {
                            this.errors++;
                            result = { "result": `${fieldlabel} is required` };

                        }
                    } else if (element.type == "email") {
                        if (!this.validateEmail(element.value)) {
                            this.errors++;
                            result = { "result": `Please provide a valid email address on ${fieldlabel} field` };
                        }
                    } else if (element.type == "tel") {
                        let digits = element.value.trim();
                        let invalid = { "result": "You have entered an invalid mobile number" };

                        if (digits == "") {
                            this.errors++;
                            result = { "result": `${fieldlabel} is required` };
                        }
                        if (digits.length == 11) {
                            // check if it starts with 09
                            if (digits.substr(0, 2) !== "09") {
                                this.errors++;
                                result = invalid;
                            }
                        } else if (digits.length == 12) {
                            // check if it starts with 63
                            if (digits.substr(0, 2) !== "63") {
                                this.errors++;
                                result = invalid;
                            }
                        } else {
                            this.errors++;
                            result = invalid;
                        }
                    } else if (element.type == "file") {
                        if (!element.files.length) {
                            this.errors++;
                            result = { "result": `No file chosen for ${fieldlabel}` };
                        }
                    } else {
                        if (element.value.trim() === "") {
                            this.errors++;
                            result = { "result": `${fieldlabel} is required` };
                        }
                    }
                });
                return result;
            }

        },
    },
    http: function (method, url, data, async = true) {
        /**
         * EGMPC.http('POST','url.php',formData).then(response => {
         * 
         * }).catch(error => {
         * 
         * });
         */
        return new Promise(function (resolve, reject) {
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                    if (xmlhttp.status == 200) {
                        resolve(xmlhttp.responseText);
                    } else {
                        reject(xmlhttp.responseText);
                    }
                }
            }
            xmlhttp.open(method, url, async);
            if (method.toLowerCase() == 'post')
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(data);
        });
    },
    random: function (type = "mix", length = 10) {
        /**
         * Generate random strings
         * Type: string, number and mix
         * Default: type=mix, length=10 
         */
        var result = '';
        var chars = '';
        if (type.toLowerCase().indexOf('str') > -1) {
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        } else if (type.toLowerCase().indexOf('num') > -1) {
            chars = '0123456789';
        } else {
            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        }
        var charLen = chars.length;
        for (var i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * charLen));
        }
        return result;
    },
    strPad: function (string, length = 5, pad_string, pad_type = 'left') {
        /**
         * Add an extra character at the beginning or ending of a string
         * EGMPC.strPad('1',5,'0',left); ==>  00001
         * EGMPC.strPad('1',5,'0',right); ==>  10000
         * EGMPC.strPad('hello',10,'!',right); ==> hello!!!!!  
         * 
         */
        if (typeof string == 'undefined' || !string) {
            throw new Error('strPad(string, length, pad_string, pad_type): First parameter cannot be empty');
        }
        if (typeof length !== 'number')
            throw new Error('strPad(string, length, pad_string, pad_type): Second parameter should be a type of number.');

        if (typeof pad_string === "undefined")
            throw new Error('strPad(string, length, pad_string, pad_type): pad_string cannot be empty');
        let padType = (pad_type.toLowerCase() !== 'right') ? 'left' : 'right';
        let padLen = string.toString().length;
        let padString = pad_string.toString();

        if (padLen >= length) {
            return string;
        }

        let newLen = length - padLen;

        let padText = padString.repeat(newLen);
        let paddedString = '';

        padText = padText.substr(0, newLen);
        if (padType == 'left') {
            paddedString = padText + string.toString();

        } else {
            paddedString = string.toString() + padText;
        }
        return paddedString;

    },
}
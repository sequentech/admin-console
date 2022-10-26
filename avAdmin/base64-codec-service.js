/**
 * This file is part of admin-console.
 * Copyright (C) 2022  Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
**/

/**
 * Service to manage the keys ceremony modal steps.
 */
 angular
 .module('avAdmin')
 .factory('Base64Codec', function($q)
 {
    var service = {
    };

    service.base64ToBlob = function (base64File, mimeType) {
        // Decode Base64 string
        var decodedData = window.atob(base64File);

        // Create UNIT8ARRAY of size same as row data length
        var uInt8Array = new Uint8Array(decodedData.length);

        // Insert all character code into uInt8Array
        for (var i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
        }

        // Return BLOB image after conversion
        return new Blob([uInt8Array], { type: mimeType });
    };

    service.fileToBase64 = function (file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function () {
            // example "data:application/x-gzip;base64,{{ base64 encoded }}"
            var parts = reader.result.split(",");
            deferred.resolve(parts[1]);
            };
            reader.onerror = function (error) {
            deferred.reject(error);
        };

        return deferred.promise;
    };

    return service;
 });
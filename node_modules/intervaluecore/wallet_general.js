/*jslint node: true */
"use strict";
var async = require('async');
var db = require('./db.js');
var device = require('./device.js');



// unlike similar function in network, this function sends multiple chains in a single package
function sendPrivatePayments(device_address, arrChains, bForwarded, conn, onSaved){
	var body = {chains: arrChains};
	if (bForwarded)
		body.forwarded = true;
	device.sendMessageToDevice(device_address, "private_payments", body, {
		ifOk: function(){},
		ifError: function(){},
		onSaved: onSaved
	}, conn);
}

function forwardPrivateChainsToDevices(arrDeviceAddresses, arrChains, bForwarded, conn, onSaved){
	console.log("devices: "+arrDeviceAddresses);
	async.eachSeries(
		arrDeviceAddresses,
		function(device_address, cb){
			console.log("forwarding to device "+device_address);
			sendPrivatePayments(device_address, arrChains, bForwarded, conn, cb);
		},
		onSaved
	);
}

/**
 * 读取地址
 * @param handleAddresses
 */
function readMyAddresses(handleAddresses){
	db.query("SELECT address FROM my_addresses \n\
		UNION SELECT shared_address AS address FROM shared_addresses \n\
		UNION SELECT address FROM sent_mnemonics LEFT JOIN unit_authors USING(address) WHERE unit_authors.unit IS NULL", function(rows){
		var arrAddresses = rows.map(function(row){ return row.address; });
		handleAddresses(arrAddresses);
	});
}

exports.sendPrivatePayments = sendPrivatePayments;
exports.forwardPrivateChainsToDevices = forwardPrivateChainsToDevices;
exports.readMyAddresses = readMyAddresses;

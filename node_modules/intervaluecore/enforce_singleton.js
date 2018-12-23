/*jslint node: true */
"use strict";

if (global._bIntervalueCoreLoaded)
	throw Error("Looks like you are loading multiple copies of intervaluecore, which is not supported.\nRunnung 'npm dedupe' might help.");

global._bIntervalueCoreLoaded = true;

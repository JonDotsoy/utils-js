# Changelog

## [0.9.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.8.1...utils-js-v0.9.0) (2025-05-12)


### Features

* **pipe:** enhance pipe functionality with comprehensive tests and documentation ([#21](https://github.com/JonDotsoy/utils-js/issues/21)) ([b7bf623](https://github.com/JonDotsoy/utils-js/commit/b7bf6238bb91ccbf27e8b2471b4de774fdf1d252))

## [0.8.1](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.8.0...utils-js-v0.8.1) (2025-05-12)


### Bug Fixes

* **bytes:** enhance Bytes class with flexible creation and improved documentation ([#19](https://github.com/JonDotsoy/utils-js/issues/19)) ([2bf6ced](https://github.com/JonDotsoy/utils-js/commit/2bf6ced8ec182e4ed4956a0b67a1a1712688c97e))

## [0.8.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.7.0...utils-js-v0.8.0) (2025-05-12)


### Features

* implement Bytes and BytesFormat classes for byte manipulation and formatting ([#17](https://github.com/JonDotsoy/utils-js/issues/17)) ([8619c6a](https://github.com/JonDotsoy/utils-js/commit/8619c6a9f5de14d1457a2295d4ac1f54c673ec8b))

## [0.7.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.6.0...utils-js-v0.7.0) (2025-05-08)


### Features

* add date conversion utilities and enhance value extraction logic ([4fde1c0](https://github.com/JonDotsoy/utils-js/commit/4fde1c05acc821995f2d135b3f826167c4f0c870))
* add invokeSafely utility and enhance getNumber validation logic ([6f59ad4](https://github.com/JonDotsoy/utils-js/commit/6f59ad49d51705966799506476bea12fd94b563f))
* add tests for number and bigint parsing from strings ([7f2453d](https://github.com/JonDotsoy/utils-js/commit/7f2453d8b84a13d5143279ce336a7906e71699a0))
* enhance bigint validation logic in getBigint utility ([89004b6](https://github.com/JonDotsoy/utils-js/commit/89004b632d20282e378d0b18055d72e398c7b9e3))
* enhance value extraction utilities with custom type validators ([498bee7](https://github.com/JonDotsoy/utils-js/commit/498bee7123f821290321bfe6d83e3a0497cf5aa1))
* **get:** enhance value extraction utilities with type validation and date handling ([#15](https://github.com/JonDotsoy/utils-js/issues/15)) ([2206e6a](https://github.com/JonDotsoy/utils-js/commit/2206e6a2c17dfb418cd6cdcc6193f3fd799b6e5c))


### Bug Fixes

* correct bigint retrieval test to expect a valid bigint value ([d0aadc4](https://github.com/JonDotsoy/utils-js/commit/d0aadc4b112d408c84acb6493f3256d372d44e9c))
* correct syntax error in getBigint validator function ([6bacb72](https://github.com/JonDotsoy/utils-js/commit/6bacb727bc230885498a111c7fac5567e8302e0c))
* update bigint retrieval logic to correctly handle invalid types ([d7a4f95](https://github.com/JonDotsoy/utils-js/commit/d7a4f95d6d1589e76185b20acfa9709e106cdb56))

## [0.6.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.5.2...utils-js-v0.6.0) (2025-01-23)


### Features

* add cleanuptasks utilities ([792f18e](https://github.com/JonDotsoy/utils-js/commit/792f18e8e356136fc1c52226f40222ed0705bbc6))

## [0.5.2](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.5.1...utils-js-v0.5.2) (2024-10-01)


### Bug Fixes

* update import locations names ([05dd919](https://github.com/JonDotsoy/utils-js/commit/05dd919322a8b8aa25f125d074dca079cdabbb17))

## [0.5.1](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.5.0...utils-js-v0.5.1) (2024-09-27)


### Bug Fixes

* avoid visit the same node 2 times ([0433555](https://github.com/JonDotsoy/utils-js/commit/0433555e2a562ae771be566a175805d59d12e8b5))

## [0.5.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.4.2...utils-js-v0.5.0) (2024-09-24)


### Features

* add `getParent` and `getFieldName` on visit utilities ([920ef85](https://github.com/JonDotsoy/utils-js/commit/920ef85e139d10a022e0bad9d7b3f49aa7a22b66))


### Performance Improvements

* upgrade strategy to build export files ([853da5b](https://github.com/JonDotsoy/utils-js/commit/853da5bbd0b561b5a287e10a7ac6158b7e5670ce))

## [0.4.2](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.4.1...utils-js-v0.4.2) (2024-09-23)


### Bug Fixes

* **result:** improvement typescript support ([3f70e68](https://github.com/JonDotsoy/utils-js/commit/3f70e689ae48fb4adbf768b291aaf9cdcf746aac))


### Performance Improvements

* remove code unused ([00eb1d2](https://github.com/JonDotsoy/utils-js/commit/00eb1d28d0852d6418579f7da5025e0df389e3d3))

## [0.4.1](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.4.0...utils-js-v0.4.1) (2024-09-23)


### Bug Fixes

* export `result` and `SymbolResult` on main module ([ef9c76c](https://github.com/JonDotsoy/utils-js/commit/ef9c76c8d38ff017b82ade7acfbedcc9892e5f31))

## [0.4.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.3.1...utils-js-v0.4.0) (2024-09-23)


### Features

* add `result` function to wrap error and result expected. Also add the symbol-result as constant value. ([01bca09](https://github.com/JonDotsoy/utils-js/commit/01bca09f7a2ac11dc53dcc813ad32de892a69890))

## [0.3.1](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.3.0...utils-js-v0.3.1) (2024-09-23)


### Miscellaneous Chores

* release 0.3.1 ([467ca73](https://github.com/JonDotsoy/utils-js/commit/467ca73f36f842d8b273feeec88dcaebd43d1083))

## [0.3.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.2.1...utils-js-v0.3.0) (2024-09-23)


### Features

* add pipe function ([d027648](https://github.com/JonDotsoy/utils-js/commit/d027648c3aa766e6e845e5d2f0d9322b664b39cc))

## [0.2.1](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.2.0...utils-js-v0.2.1) (2024-09-12)


### Performance Improvements

* refactor set.ts to use get module and simplify function ([ceaf9c8](https://github.com/JonDotsoy/utils-js/commit/ceaf9c88a4d1c9d9d6674e7c962f9b7b89ce2237))

## [0.2.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.1.0...utils-js-v0.2.0) (2024-09-12)


### Features

* add functionality to set.ts for setting values at specified path within a nested object structure and providing example usage in JSDoc comments ([c5e5b3d](https://github.com/JonDotsoy/utils-js/commit/c5e5b3d9f97bfdd3fbc96b6126a4758fe40db9da))
* add set command to package.json ([bcc451a](https://github.com/JonDotsoy/utils-js/commit/bcc451a31fc74b55befcdd09df7e09597d1e49fe))

## [0.1.0](https://github.com/JonDotsoy/utils-js/compare/utils-js-v0.0.4...utils-js-v0.1.0) (2024-09-12)


### Features

* add visit and get library ([1c99bea](https://github.com/JonDotsoy/utils-js/commit/1c99bea924e1e1d769c62f4cfe667f62fbc29453))
* bump version to 0.0.4 and add repository field to package.json ([a3077d6](https://github.com/JonDotsoy/utils-js/commit/a3077d640072eacc6b0a4021969b2873aea882b1))


### Bug Fixes

* add validation for date and number types in get array schema, and add alias and is method to the get function ([2b31f2f](https://github.com/JonDotsoy/utils-js/commit/2b31f2fa8d27fcb38b4855cd623387b84e650596))

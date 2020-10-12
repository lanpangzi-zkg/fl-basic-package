#!/usr/bin/env node

const childProcess = require('child_process');
const path = require('path');
const fs = require('fs');
const package = require(path.resolve(__dirname, '../', 'package.json'));

const dependencies = ['react@16.8.6', 'react-dom@16.8.6', 'react-router-dom@4.3.1',
	'prop-types@15.7.2', 'dva@2.4.1', 'dva-loading@2.0.1', 'antd@3.26.13', 'axios@0.18.0'];

function packagejsonExist() {
	return fs.existsSync(path.resolve(process.cwd(), 'package.json'));
}

function partialCli(fn) {
	return function exec(...args) {
		if (!packagejsonExist()) {
			console.log('警告：请在项目根目录运行命令');
			return Promise.reject();
		}
		return fn(...args);
	};
}

function execCli(npmCli, successTips) {
	return new Promise((resolve, reject) => {
		childProcess.exec(npmCli, function(error) {
		    if (error) {
		    	console.log('执行命令异常:', error.stack);
		    	reject(error);
		        return;
		    }
		    console.log(successTips);
		    resolve();
		});
	});

}

function _uninstall() {
	console.log('即将移除基础依赖库');
	const uninstallPkg = dependencies.map((depItem) => {
		return depItem.slice(0, depItem.indexOf('@'));
	}).join(' ');
	return execCli(`npm uninstall ${uninstallPkg}`, '基础库依赖移除成功');
}

function _install() {
	console.log('即将安装基础依赖库，等耐心等待......');
	return execCli(`npm install ${dependencies.join(' ')} --save`, '基础库依赖安装成功');
}

const uninstall = partialCli(_uninstall);
const install = partialCli(_install);

(function start() {
	const [, , param] = process.argv;
	if (param === 'version' || param === '-v') {
		console.log(package.version);
		return;
	}
	if (param === 'uninstall') {
		uninstall();
		return;
	}
	uninstall().then(install).catch((err) => {});
})();
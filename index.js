'use strict';

/*
* 1. Logo 设计
* 2. 回车键复制已翻译的文本
* 3. 发音
* */

const alfy = require('alfy');
const md5 = require('md5');

const baiduTransAPI = {
	url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
	appid: '20170625000060222',
	key: '2dlAYT1dFruhnrQj7yWL',
	salt: 1039057373
};

const alfredQuery = alfy.input || 'yes to 日语';

const LANGUAGE_MAP = {
	zh:	'中文',
	en:	'英语',
	yue: '粤语',
	wyw: '文言文',
	jp:	'日语',
	kor: '韩语',
	fra: '法语',
	spa: '西班牙语',
	th:	'泰语',
	ara: '阿拉伯语',
	ru:	'俄语',
	pt:	'葡萄牙语',
	de:	'德语',
	it:	'意大利语',
	el:	'希腊语',
	nl:	'荷兰语',
	pl:	'波兰语',
	bul: '保加利亚语',
	est: '爱沙尼亚语',
	dan: '丹麦语',
	fin: '芬兰语',
	cs:	'捷克语',
	rom: '罗马尼亚语',
	slo: '斯洛文尼亚语',
	swe: '瑞典语',
	hu:	'匈牙利语',
	cht: '繁体中文',
	vie: '越南语',
};

function checkIsChineseText(str) {
	return new RegExp("[\\u4E00-\\u9FFF]+", 'g').test(str);
}

function checkUserDidCustomTargetLang(str) {
	let userCustomTransLang = null;

	for (let key in LANGUAGE_MAP){
		const result = new RegExp(` to ${key}$| to ${LANGUAGE_MAP[key]}$`).exec(str);

		if (result){
			userCustomTransLang = result[0].split(' to ')[1];
		}
	}
	return userCustomTransLang;
}

function getTransLanguage(str) {
	// 判断用户是否手动转换了目标语言，如果是的话，使用用户的设定。
	let userCustomTargetLang = checkUserDidCustomTargetLang(str);
	if (userCustomTargetLang) {
		if (checkIsChineseText(userCustomTargetLang)){
			for (let langKey in LANGUAGE_MAP) {
				LANGUAGE_MAP[langKey] === userCustomTargetLang ? userCustomTargetLang = langKey : '';
			}
		}

		return userCustomTargetLang
	}

	//默认如果用户输入的是中文的话，那直接转换成英文，如果用户输入的是非中文，则默认转换成中文。
	const isChinese = checkIsChineseText(str);
	if (isChinese) {
		return 'en'
	}
	return 'zh'
}

let params = {
	method: 'POST',
	body: {
		q: alfredQuery,
		from: 'auto',
		to: getTransLanguage(alfredQuery),
		appid: baiduTransAPI.appid,
		salt: baiduTransAPI.salt,
		sign: md5(baiduTransAPI.appid + alfredQuery + baiduTransAPI.salt + baiduTransAPI.key)
	}
};

alfy.fetch(baiduTransAPI.url, params).then(
	res => {
		let result = res.trans_result.map(res => {
			return {
				title: res.src,
				subtitle: res.dst
			}
		});

		alfy.output(result);
	});

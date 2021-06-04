import {
	OptionsWithUri,
} from 'request';

import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeProperties,
	NodeApiError,
} from 'n8n-workflow';

import {
	upperFirst,
} from 'lodash';

export async function webexApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, method: string, resource: string, body: any = {}, qs: IDataObject = {}, uri?: string, option: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any
	let options: OptionsWithUri = {
		method,
		body,
		qs,
		uri: uri || `https://webexapis.com/v1${resource}`,
		json: true,
	};
	try {
		if (Object.keys(option).length !== 0) {
			options = Object.assign({}, options, option);
		}
		if (Object.keys(body).length === 0) {
			delete options.body;
		}
		if (Object.keys(qs).length === 0) {
			delete options.qs;
		}
		console.log(options);
		//@ts-ignore
		return await this.helpers.requestOAuth2.call(this, 'ciscoWebexOAuth2Api', options, { tokenType: 'Bearer' });
	} catch (error) {
		//console.log(error.response)
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function webexApiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, propertyName: string, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	let uri: string | undefined;
	query.max = 100;
	do {
		responseData = await webexApiRequest.call(this, method, endpoint, body, query, uri, { resolveWithFullResponse: true });
		console.log('este es el response');
		console.log(responseData);	
		if (responseData.headers.link) {
			uri = responseData.headers['link'].split(';')[0].replace('<', '').replace('>', '');
		}
		returnData.push.apply(returnData, responseData.body[propertyName]);
	} while (
		responseData.headers['link'] !== undefined &&
		responseData.headers['link'].includes('rel="next"')
	);
	return returnData;
}

export function getEvents() {
	const resourceEvents: { [key: string]: string[] } = {
		'attachmentAction': ['created', 'deleted', 'updated', '*'],
		'membership': ['created', 'deleted', 'updated', '*'],
		'message': ['created', 'deleted', 'updated', '*'],
		'room': ['created', 'deleted', 'updated', '*'],
		'meeting': ['created', 'deleted', 'updated', 'started', 'ended', '*'],
		'recording': ['created', 'deleted', 'updated', '*'],
		'telephonyCall': ['created', 'deleted', 'updated'],
		'*': ['created', 'updated', 'deleted', '*'],
	};

	const elements: INodeProperties[] = [];

	for (const resource of Object.keys(resourceEvents)) {
		elements.push({
			displayName: 'Event',
			name: 'event',
			type: 'options',
			displayOptions: {
				show: {
					resource: [
						(resource === '*') ? 'all' : resource,
					],
				},
			},
			options: resourceEvents[resource].map((event) => ({ value: (event === '*' ? 'all' : event), name: upperFirst(event) })),
			default: '',
			required: true,
		});
	}
	return elements;
}

export function mapResource(event: string) {
	return ({
		'attachmentAction': 'attachmentActions',
		'membership': 'memberships',
		'message': 'messages',
		'room': 'rooms',
		'meeting': 'meetings',
		'recording': 'recordings',
		'telephonyCall': 'telephony_calls',
	} as { [key: string]: string })[event];
}
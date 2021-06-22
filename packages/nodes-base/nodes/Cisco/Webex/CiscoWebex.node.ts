import {
	BINARY_ENCODING,
	IExecuteFunctions,
} from 'n8n-core';

import {
	IBinaryData,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	getAttachemnts,
	webexApiRequest,
	webexApiRequestAllItems,
} from './GenericFunctions';

import {
	meetingFields,
	meetingOperations,
	messageFields,
	messageOperations,
} from './descriptions';

import * as moment from 'moment-timezone';

export class CiscoWebex implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Cisco Webex',
		name: 'ciscoWebex',
		icon: 'file:ciscoWebex.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Cisco Webex API',
		defaults: {
			name: 'Cisco Webex',
			color: '#29b6f6',
		},
		credentials: [
			{
				name: 'ciscoWebexOAuth2Api',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Meeeting',
						value: 'meeting',
					},
					{
						name: 'Message',
						value: 'message',
					},
				],
				default: 'message',
				description: 'Resource to consume',
			},
			...meetingOperations,
			...meetingFields,
			...messageOperations,
			...messageFields,
		],
	};

	methods = {
		loadOptions: {
			async getRooms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const rooms = await webexApiRequestAllItems.call(this, 'items', 'GET', '/rooms');
				for (const room of rooms) {
					returnData.push({
						name: room.title,
						value: room.id,
					});
				}
				return returnData;
			},
			async getSites(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const sites = await webexApiRequestAllItems.call(this, 'sites', 'GET', '/meetingPreferences/sites');
				for (const site of sites) {
					returnData.push({
						name: site.siteUrl,
						value: site.siteUrl,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const timezone = this.getTimezone();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;

		for (let i = 0; i < items.length; i++) {

			if (resource === 'message') {

				// **********************************************************************
				//                                message
				// **********************************************************************

				if (operation === 'create') {

					// ----------------------------------------
					//             message: create
					// ----------------------------------------

					// https://developer.webex.com/docs/api/v1/messages/create-a-message

					const destination = this.getNodeParameter('destination', i);
					const markdown = this.getNodeParameter('markdown', i);
					const file = this.getNodeParameter('additionalFields.fileUi.fileValue', i, {}) as IDataObject;
					const body = {} as IDataObject;
					if (destination === 'room') {
						body['roomId'] = this.getNodeParameter('roomId', i);
					}

					if (destination === 'personId') {
						body['toPersonId'] = this.getNodeParameter('toPersonId', i);
					}

					if (destination === 'personEmail') {
						body['toPersonEmail'] = this.getNodeParameter('toPersonEmail', i);
					}

					if (markdown === true) {
						body['markdown'] = this.getNodeParameter('markdownText', i);
					} else {
						body['text'] = this.getNodeParameter('text', i);
					}

					body.attachments = getAttachemnts(this.getNodeParameter('additionalFields.attachmentsUi.attachmentValues', i, []) as IDataObject[]);

					if (Object.keys(file).length) {

						const isBinaryData = file.binaryData;

						if (isBinaryData) {

							if (!items[i].binary) {
								throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
							}

							const binaryPropertyName = file.binaryPropertyName as string;

							const binaryData = items[i].binary![binaryPropertyName] as IBinaryData;

							const formData = {
								files: {
									value: Buffer.from(binaryData.data, BINARY_ENCODING),
									options: {
										filename: binaryData.fileName,
										contentType: binaryData.mimeType,
									},
								},
							};
							Object.assign(body, formData);
						} else {
							const url = file.url as string;
							Object.assign(body, { files: url });
						}
					}

					if (file.binaryData === true) {
						responseData = await webexApiRequest.call(this, 'POST', '/messages', {}, {}, undefined, { formData: body });
					} else {
						responseData = await webexApiRequest.call(this, 'POST', '/messages', body);
					}

				} else if (operation === 'delete') {

					// ----------------------------------------
					//             message: delete
					// ----------------------------------------

					// https://developer.webex.com/docs/api/v1/messages/delete-a-message

					const messageId = this.getNodeParameter('messageId', i);

					const endpoint = `/messages/${messageId}`;
					responseData = await webexApiRequest.call(this, 'DELETE', endpoint);
					responseData = { success: true };

				} else if (operation === 'get') {

					// ----------------------------------------
					//               message: get
					// ----------------------------------------

					// https://developer.webex.com/docs/api/v1/messages/get-message-details

					const messageId = this.getNodeParameter('messageId', i);

					const endpoint = `/messages/${messageId}`;
					responseData = await webexApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//             message: getAll
					// ----------------------------------------

					// https://developer.webex.com/docs/api/v1/messages/list-messages

					const qs: IDataObject = {
						roomId: this.getNodeParameter('roomId', i),
					};
					const filters = this.getNodeParameter('filters', i) as IDataObject;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;


					if (Object.keys(filters).length) {
						Object.assign(qs, filters);
					}

					if (returnAll === true) {
						responseData = await webexApiRequestAllItems.call(this, 'items', 'GET', '/messages', {}, qs);
					} else {
						qs.max = this.getNodeParameter('limit', i) as number;
						responseData = await webexApiRequest.call(this, 'GET', '/messages', {}, qs);
						responseData = responseData.items;
					}
				} else if (operation === 'update') {

					// ----------------------------------------
					//             message: update
					// ----------------------------------------

					// https://developer.webex.com/docs/api/v1/messages/edit-a-message
					const messageId = this.getNodeParameter('messageId', i) as string;
					const markdown = this.getNodeParameter('markdown', i) as boolean;

					const endpoint = `/messages/${messageId}`;

					responseData = await webexApiRequest.call(this, 'GET', endpoint);

					const body = {
						roomId: responseData.roomId,
					} as IDataObject;

					if (markdown === true) {
						body['markdown'] = this.getNodeParameter('markdownText', i);
					} else {
						body['text'] = this.getNodeParameter('text', i);
					}

					responseData = await webexApiRequest.call(this, 'PUT', endpoint, body);
				}
			}

			if (resource === 'meeting') {
				if (operation === 'create') {
					const title = this.getNodeParameter('title', i) as string;
					const start = this.getNodeParameter('start', i) as string;
					const end = this.getNodeParameter('end', i) as string;
					const invitees = this.getNodeParameter('additionalFields.inviteesUi.inviteeValues', i, []) as IDataObject[];
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const body: IDataObject = {
						title,
						start: moment.tz(start, timezone).format(),
						end: moment.tz(end, timezone).format(),
						...additionalFields,
					};

					if (invitees) {
						body['invitees'] = invitees;
						delete body.inviteesUi;
					}

					if (!Object.keys(body.registration as IDataObject).length) {
						delete body.registration;
					}

					responseData = await webexApiRequest.call(this, 'POST', '/meetings', body);
				}

				if (operation === 'delete') {
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const options = this.getNodeParameter('options', i) as IDataObject;

					const qs: IDataObject = {
						...options,
					};

					responseData = await webexApiRequest.call(this, 'DELETE', `/meetings/${meetingId}`, {}, qs);
				}

				if (operation === 'get') {
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const options = this.getNodeParameter('options', i) as IDataObject;
					let headers = {};

					const qs: IDataObject = {
						...options,
					};

					if (options.passsword) {
						headers = {
							passsword: options.passsword,
						};
					}

					responseData = await webexApiRequest.call(this, 'GET', `/meetings/${meetingId}`, {}, qs, undefined, { headers });
				}

				if (operation === 'getAll') {
					const filters = this.getNodeParameter('filters', i) as IDataObject;
					const options = this.getNodeParameter('options', i) as IDataObject;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					let headers = {};

					const qs: IDataObject = {
						...filters,
					};

					if (options.passsword) {
						headers = {
							passsword: options.passsword,
						};
					}

					if (qs.from) {
						qs.from = moment.tz(qs.from, timezone).format();
					}

					if (qs.to) {
						qs.to = moment.tz(qs.to, timezone).format();
					}

					if (returnAll === true) {
						responseData = await webexApiRequestAllItems.call(this, 'items', 'GET', '/meetings', {}, qs, { headers });
					} else {
						qs.max = this.getNodeParameter('limit', i) as number;
						responseData = await webexApiRequest.call(this, 'GET', '/meetings', {}, qs, undefined, { headers });
						responseData = responseData.items;
					}
				}

				if (operation === 'update') {
					const meetingId = this.getNodeParameter('meetingId', i) as string;
					const invitees = this.getNodeParameter('updateFields.inviteesUi.inviteeValues', i, []) as IDataObject[];
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					const body: IDataObject = {
						...updateFields,
					};

					if (invitees) {
						body['invitees'] = invitees;
						delete body.inviteesUi;
					}

					if (!Object.keys(body.registration as IDataObject).length) {
						delete body.registration;
					}

					if (body.from) {
						body.from = moment.tz(body.from, timezone).format();
					}

					if (body.to) {
						body.to = moment.tz(body.to, timezone).format();
					}

					responseData = await webexApiRequest.call(this, 'PUT', `/meetings/${meetingId}`, body);
				}
			}

			Array.isArray(responseData)
				? returnData.push(...responseData)
				: returnData.push(responseData);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
} 
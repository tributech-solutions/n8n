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
	messageFields,
	messageOperations,
} from './descriptions';

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
						name: 'Message',
						value: 'message',
					},
				],
				default: 'message',
				description: 'Resource to consume',
			},
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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

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
			Array.isArray(responseData)
				? returnData.push(...responseData)
				: returnData.push(responseData);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
} 
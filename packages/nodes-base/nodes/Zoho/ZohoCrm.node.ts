import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	adjustAccountFields,
	adjustContactFields,
	adjustInvoiceFields,
	adjustLeadFields,
	adjustPurchaseOrderFields,
	adjustQuoteFields,
	adjustSalesOrderFields,
	handleListing,
	zohoApiRequest,
} from './GenericFunctions';

import {
	accountFields,
	accountOperations,
	contactFields,
	contactOperations,
	dealFields,
	dealOperations,
	invoiceFields,
	invoiceOperations,
	leadFields,
	leadOperations,
	purchaseOrderFields,
	purchaseOrderOperations,
	quoteFields,
	quoteOperations,
	salesOrderFields,
	salesOrderOperations,
} from './descriptions';

export class ZohoCrm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoho',
		name: 'zoho',
		icon: 'file:zoho.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Zoho API',
		defaults: {
			name: 'Zoho',
			color: '\#CE2232',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zohoOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Invoice',
						value: 'invoice',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Purchase Order',
						value: 'purchaseOrder',
					},
					{
						name: 'Quote',
						value: 'quote',
					},
					{
						name: 'Sales Order',
						value: 'salesOrder',
					},
				],
				default: 'account',
				description: 'Resource to consume',
			},
			...accountOperations,
			...accountFields,
			...contactOperations,
			...contactFields,
			...dealOperations,
			...dealFields,
			...invoiceOperations,
			...invoiceFields,
			...leadOperations,
			...leadFields,
			...purchaseOrderOperations,
			...purchaseOrderFields,
			...quoteOperations,
			...quoteFields,
			...salesOrderOperations,
			...salesOrderFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let responseData;

		for (let i = 0; i < items.length; i++) {

			// https://www.zoho.com/crm/developer/docs/api/insert-records.html
			// https://www.zoho.com/crm/developer/docs/api/get-records.html
			// https://www.zoho.com/crm/developer/docs/api/update-specific-record.html
			// https://www.zoho.com/crm/developer/docs/api/delete-specific-record.html

			if (resource === 'account') {

				// **********************************************************************
				//                                account
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/accounts-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//             account: create
					// ----------------------------------------

					const body: IDataObject = {
						Account_Name: this.getNodeParameter('accountName', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustAccountFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/accounts', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//             account: delete
					// ----------------------------------------

					const accountId = this.getNodeParameter('accountId', i);

					const endpoint = `/accounts/${accountId}`;
					responseData = await zohoApiRequest.call(this, 'DELETE', endpoint);

				} else if (operation === 'get') {

					// ----------------------------------------
					//               account: get
					// ----------------------------------------

					const accountId = this.getNodeParameter('accountId', i);

					const endpoint = `/accounts/${accountId}`;
					responseData = await zohoApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//             account: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/accounts', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//             account: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustAccountFields(updateFields));
					}

					const accountId = this.getNodeParameter('accountId', i);

					const endpoint = `/accounts/${accountId}`;
					responseData = await zohoApiRequest.call(this, 'PUT', endpoint, body);

				}

			} else if (resource === 'contact') {

				// **********************************************************************
				//                                contact
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/contacts-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//             contact: create
					// ----------------------------------------

					const body: IDataObject = {
						Last_Name: this.getNodeParameter('Last_Name', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustContactFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/contacts', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//             contact: delete
					// ----------------------------------------

					const contactId = this.getNodeParameter('contactId', i);

					const endpoint = `/contacts/${contactId}`;
					responseData = await zohoApiRequest.call(this, 'DELETE', endpoint);

				} else if (operation === 'get') {

					// ----------------------------------------
					//               contact: get
					// ----------------------------------------

					const contactId = this.getNodeParameter('contactId', i);

					const endpoint = `/contacts/${contactId}`;
					responseData = await zohoApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//             contact: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/contacts', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//             contact: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustContactFields(updateFields));
					}

					const contactId = this.getNodeParameter('contactId', i);

					const endpoint = `/contacts/${contactId}`;
					responseData = await zohoApiRequest.call(this, 'PUT', endpoint, body);

				}

			} else if (resource === 'deal') {

				// **********************************************************************
				//                                  deal
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/deals-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//               deal: create
					// ----------------------------------------

					const body: IDataObject = {
						Deal_Name: this.getNodeParameter('Deal_Name', i),
						Stage: this.getNodeParameter('Stage', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, additionalFields);
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/deals', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//               deal: delete
					// ----------------------------------------

					const dealId = this.getNodeParameter('dealId', i);

					responseData = await zohoApiRequest.call(this, 'DELETE', `/deals/${dealId}`);

				} else if (operation === 'get') {

					// ----------------------------------------
					//                deal: get
					// ----------------------------------------

					const dealId = this.getNodeParameter('dealId', i);

					responseData = await zohoApiRequest.call(this, 'GET', `/deals/${dealId}`);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//               deal: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/deals', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//               deal: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, updateFields);
					}

					const dealId = this.getNodeParameter('dealId', i);

					responseData = await zohoApiRequest.call(this, 'PUT', `/deals/${dealId}`, body);

				}

			} else if (resource === 'invoice') {

				// **********************************************************************
				//                                invoice
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/invoices-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//             invoice: create
					// ----------------------------------------

					const body: IDataObject = {
						Product_Details: this.getNodeParameter('Product_Details', i),
						Subject: this.getNodeParameter('Subject', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustInvoiceFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/invoices', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//             invoice: delete
					// ----------------------------------------

					const invoiceId = this.getNodeParameter('invoiceId', i);

					const endpoint = `/invoices/${invoiceId}`;
					responseData = await zohoApiRequest.call(this, 'DELETE', endpoint);

				} else if (operation === 'get') {

					// ----------------------------------------
					//               invoice: get
					// ----------------------------------------

					const invoiceId = this.getNodeParameter('invoiceId', i);

					const endpoint = `/invoices/${invoiceId}`;
					responseData = await zohoApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//             invoice: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/invoices', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//             invoice: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustInvoiceFields(updateFields));
					}

					const invoiceId = this.getNodeParameter('invoiceId', i);

					const endpoint = `/invoices/${invoiceId}`;
					responseData = await zohoApiRequest.call(this, 'PUT', endpoint, body);

				}

			} else if (resource === 'lead') {

				// **********************************************************************
				//                                  lead
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/leads-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//               lead: create
					// ----------------------------------------

					const body: IDataObject = {
						Company: this.getNodeParameter('Company', i),
						Last_Name: this.getNodeParameter('Last_Name', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustLeadFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/leads', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//               lead: delete
					// ----------------------------------------

					const leadId = this.getNodeParameter('leadId', i);

					responseData = await zohoApiRequest.call(this, 'DELETE', `/leads/${leadId}`);

				} else if (operation === 'get') {

					// ----------------------------------------
					//                lead: get
					// ----------------------------------------

					const leadId = this.getNodeParameter('leadId', i);

					responseData = await zohoApiRequest.call(this, 'GET', `/leads/${leadId}`);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//               lead: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/leads', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//               lead: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustLeadFields(updateFields));
					}

					const leadId = this.getNodeParameter('leadId', i);

					responseData = await zohoApiRequest.call(this, 'PUT', `/leads/${leadId}`, body);

				}

			} else if (resource === 'purchaseOrder') {

				// **********************************************************************
				//                             purchaseOrder
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/purchase-orders-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//          purchaseOrder: create
					// ----------------------------------------

					const body: IDataObject = {
						Subject: this.getNodeParameter('Subject', i),
						Vendor_Name: this.getNodeParameter('Vendor_Name', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustPurchaseOrderFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/purchaseorders', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//          purchaseOrder: delete
					// ----------------------------------------

					const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i);

					const endpoint = `/purchaseorders/${purchaseOrderId}`;
					responseData = await zohoApiRequest.call(this, 'DELETE', endpoint);

				} else if (operation === 'get') {

					// ----------------------------------------
					//            purchaseOrder: get
					// ----------------------------------------

					const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i);

					const endpoint = `/purchaseorders/${purchaseOrderId}`;
					responseData = await zohoApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//          purchaseOrder: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/purchaseorders', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//          purchaseOrder: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustPurchaseOrderFields(updateFields));
					}

					const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i);

					const endpoint = `/purchaseorders/${purchaseOrderId}`;
					responseData = await zohoApiRequest.call(this, 'PUT', endpoint, body);

				}

			} else if (resource === 'quote') {

				// **********************************************************************
				//                                 quote
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/quotes-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//              quote: create
					// ----------------------------------------

					const body: IDataObject = {
						Product_Details: this.getNodeParameter('Product_Details', i),
						Subject: this.getNodeParameter('Subject', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustQuoteFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/quotes', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//              quote: delete
					// ----------------------------------------

					const quoteId = this.getNodeParameter('quoteId', i);

					responseData = await zohoApiRequest.call(this, 'DELETE', `/quotes/${quoteId}`);

				} else if (operation === 'get') {

					// ----------------------------------------
					//                quote: get
					// ----------------------------------------

					const quoteId = this.getNodeParameter('quoteId', i);

					responseData = await zohoApiRequest.call(this, 'GET', `/quotes/${quoteId}`);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//              quote: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/quotes', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//              quote: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustQuoteFields(updateFields));
					}

					const quoteId = this.getNodeParameter('quoteId', i);

					responseData = await zohoApiRequest.call(this, 'PUT', `/quotes/${quoteId}`, body);

				}

			} else if (resource === 'salesOrder') {

				// **********************************************************************
				//                               salesOrder
				// **********************************************************************

				// https://www.zoho.com/crm/developer/docs/api/v2/sales-orders-response.html

				if (operation === 'create') {

					// ----------------------------------------
					//            salesOrder: create
					// ----------------------------------------

					const body: IDataObject = {
						Account_Name: this.getNodeParameter('Account_Name', i),
						Subject: this.getNodeParameter('Subject', i),
					};

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (Object.keys(additionalFields).length) {
						Object.assign(body, adjustSalesOrderFields(additionalFields));
					}

					responseData = await zohoApiRequest.call(this, 'POST', '/salesorders', body);

				} else if (operation === 'delete') {

					// ----------------------------------------
					//            salesOrder: delete
					// ----------------------------------------

					const salesOrderId = this.getNodeParameter('salesOrderId', i);

					const endpoint = `/salesorders/${salesOrderId}`;
					responseData = await zohoApiRequest.call(this, 'DELETE', endpoint);

				} else if (operation === 'get') {

					// ----------------------------------------
					//             salesOrder: get
					// ----------------------------------------

					const salesOrderId = this.getNodeParameter('salesOrderId', i);

					const endpoint = `/salesorders/${salesOrderId}`;
					responseData = await zohoApiRequest.call(this, 'GET', endpoint);

				} else if (operation === 'getAll') {

					// ----------------------------------------
					//            salesOrder: getAll
					// ----------------------------------------

					const body: IDataObject = {};
					const filters = this.getNodeParameter('filters', i) as IDataObject;

					if (Object.keys(filters).length) {
						Object.assign(body, filters);
					}

					responseData = await handleListing.call(this, 'GET', '/salesorders', body);

				} else if (operation === 'update') {

					// ----------------------------------------
					//            salesOrder: update
					// ----------------------------------------

					const body: IDataObject = {};
					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

					if (Object.keys(updateFields).length) {
						Object.assign(body, adjustSalesOrderFields(updateFields));
					}

					const salesOrderId = this.getNodeParameter('salesOrderId', i);

					const endpoint = `/salesorders/${salesOrderId}`;
					responseData = await zohoApiRequest.call(this, 'PUT', endpoint, body);

				}

			}

			Array.isArray(responseData)
				? returnData.push(...responseData)
				: returnData.push(responseData);

		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}

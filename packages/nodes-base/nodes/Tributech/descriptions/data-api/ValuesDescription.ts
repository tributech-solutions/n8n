import {
	INodeProperties,
} from 'n8n-workflow';

export const valuesOperations = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'value',
				],
			},
		},
		options: [
			{
				name: 'Get Values As Byte',
				value: 'getValuesAsByte',
			},
			{
				name: 'Get Values As Double',
				value: 'getValuesAsDouble',
			},
			{
				name: 'Get Values As String',
				value: 'getValuesAsString',
			},
			{
				name: 'Add Values As Base64',
				value: 'addValuesAsBase64',
			},
			{
				name: 'Add Values As Byte',
				value: 'addValuesAsByte',
			},
			{
				name: 'Add Values As Double',
				value: 'addValuesAsDouble',
			},
		],
		default: 'getValuesAsByte',
	},
] as INodeProperties[];

export const valuesFields = [
	{
		displayName: 'ValueMetadata ID',
		name: 'valueMetadataId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: [
					'value',
				],
				operation: [
					'getValuesAsByte',
					'getValuesAsDouble',
					'getValuesAsString',
				],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: [
					'value',
				],
				operation: [
					'getValuesAsByte',
					'getValuesAsDouble',
					'getValuesAsString',
				],
			},
		},
		options: [
			{
				displayName: 'PageNumber',
				name: 'pageNumber',
				description: 'Page number (first page is 1, default: 1, min: 1, max: 2147483647)',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 2147483647,
				},
				default: 1,
			},
			{
				displayName: 'OrderBy',
				name: 'orderBy',
				description: 'Sort order of the returned \'Values\' (default: "asc", alternative: "desc") Values are ordered by Timestamp',
				type: 'string',
				default: 'asc',
			},
			{
				displayName: 'PageSize',
				name: 'pageSize',
				description: 'Page size (default: 100, min: 1, max: 2147483647)',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 2147483647,
				},
				default: 100,
			},
			{
				displayName: 'To',
				name: 'to',
				description: 'Filter result by \'Timestamp\', only include \'Values\' with a \'Timestamp\' before the given filter <br /> (format: ISO 8601, default: No filtering occurs, behavior: Timestamp < To)',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'From',
				name: 'from',
				description: 'Filter result by \'Timestamp\', only include \'Values\' with a \'Timestamp\' equal or after the given filter <br /> (format: ISO 8601, default: No filtering occurs, behavior: Timestamp >= From)',
				type: 'dateTime',
				default: '',
			},
		],
	},
	{
		displayName: 'Standard',
		name: 'values',
		type: 'fixedCollection',
		placeholder: 'Add Value',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: [
					'value',
				],
				operation: [
					'addValuesAsBase64',
					'addValuesAsByte',
					'addValuesAsDouble',
				],
			},
		},
		options: [
			{
				displayName: 'Value',
				name: 'value',
				values: [
					{
						displayName: 'ValueMetadata ID',
						name: 'valueMetadataId',
						type: 'string',
						required: true,
						default: '',
					},
					{
						displayName: 'Timestamp',
						name: 'timestamp',
						type: 'string',
						required: true,
						default: '',
					},
					{
						displayName: 'Value(s)',
						name: 'values',
						type: 'json',
						required: true,
						default: '',
					},
				],
			},
		],
	},
] as INodeProperties[];

import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class CiscoWebexOAuth2Api implements ICredentialType {
	name = 'ciscoWebexOAuth2Api';
	extends = [
		'oAuth2Api',
	];
	displayName = 'Cisco Webex OAuth2 API';
	properties = [
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden' as NodePropertyTypes,
			default: 'https://webexapis.com/v1/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden' as NodePropertyTypes,
			default: 'https://webexapis.com/v1/access_token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden' as NodePropertyTypes,
			//spark:kms
			default: 'spark-admin:broadworks_subscribers_write meeting:admin_preferences_write spark:all meeting:admin_preferences_read analytics:read_all meeting:admin_participants_read spark-admin:people_write spark-admin:places_read spark-compliance:team_memberships_write spark-compliance:messages_read spark-admin:devices_write spark-admin:workspaces_write meeting:admin_schedule_write identity:placeonetimepassword_create spark-admin:organizations_write spark-admin:workspace_locations_read spark-admin:call_qualities_read spark-compliance:messages_write spark:kms meeting:participants_write spark-admin:people_read spark-compliance:memberships_read spark-admin:resource_groups_read meeting:recordings_read meeting:participants_read meeting:preferences_write meeting:admin_recordings_read spark-admin:organizations_read meeting:schedules_write spark-compliance:team_memberships_read spark-admin:devices_read meeting:controls_read spark-admin:hybrid_clusters_read spark-admin:workspace_locations_write spark-admin:broadworks_enterprises_write meeting:admin_schedule_read meeting:schedules_read spark-compliance:memberships_write spark-admin:broadworks_enterprises_read spark-admin:roles_read meeting:recordings_write meeting:preferences_read spark-admin:workspaces_read spark-admin:resource_group_memberships_read spark-compliance:events_read spark-admin:resource_group_memberships_write spark-compliance:rooms_read meeting:controls_write meeting:admin_recordings_write spark-admin:hybrid_connectors_read audit:events_read spark-compliance:teams_read spark-admin:places_write spark-admin:licenses_read spark-compliance:rooms_write',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden' as NodePropertyTypes,
			default: 'body',
		},
		{
			displayName: 'Secret',
			name: 'secret',
			type: 'string' as NodePropertyTypes,
			default: '',
			description: `The secret used to generate payload signature.</br>
			Only used for the Cisco Webex Trigger.</br>
			If empty not validation is done when the webhook is recieved`,
		},
	];
}

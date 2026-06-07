import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '2ca0deefd24646888f5d83422b81e7df'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '1fe3837b37554105b2dd59974544ba7c'
                    }
                }
                composite: [
                    {
                        table: 'sys_transform_entry'
                        id: '22222222222222222222222222222222'
                        key: {
                            map: '11111111111111111111111111111111'
                            target_field: 'u_sdk_repro_target_value'
                        }
                    },
                    {
                        table: 'sys_transform_entry'
                        id: '33333333333333333333333333333333'
                        key: {
                            map: '11111111111111111111111111111111'
                            target_field: 'u_sdk_repro_scripted_target'
                        }
                    },
                ]
            }
        }
    }
}

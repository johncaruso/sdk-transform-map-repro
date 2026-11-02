import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    '11111111111111111111111111111111': {
                        table: 'sys_transform_map'
                        id: '11111111111111111111111111111111'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'fee62bdffb5c4e7c9dc331adfbbfb789'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '263c49bc085a4230b7699cc7a75d4a02'
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

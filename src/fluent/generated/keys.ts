import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '980a7bd288ce4c9e9c6997a119926431'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '514244c2204e49af88e4e9c6cf0f50fd'
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

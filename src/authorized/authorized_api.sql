CREATE TABLE
    `authorized_api` (
        `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
        `business_key` varchar(32) NOT NULL DEFAULT '' COMMENT '调用方key',
        `method` varchar(30) NOT NULL DEFAULT '' COMMENT '请求方式',
        `api` varchar(100) NOT NULL DEFAULT '' COMMENT '请求地址',
        `is_deleted` tinyint(1) NOT NULL DEFAULT '-1' COMMENT '是否删除 1:是  -1:否',
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        `created_user` varchar(60) NOT NULL DEFAULT '' COMMENT '创建人',
        `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        `updated_user` varchar(60) NOT NULL DEFAULT '' COMMENT '更新人',
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = '已授权接口地址表';
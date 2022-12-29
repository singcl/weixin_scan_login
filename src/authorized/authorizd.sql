CREATE TABLE
    `authorized` (
        `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
        `business_key` varchar(32) NOT NULL DEFAULT '' COMMENT '调用方key',
        `business_secret` varchar(60) NOT NULL DEFAULT '' COMMENT '调用方secret',
        `business_developer` varchar(60) NOT NULL DEFAULT '' COMMENT '调用方对接人',
        `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
        `is_used` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用 1:是  -1:否',
        `is_deleted` tinyint(1) NOT NULL DEFAULT '-1' COMMENT '是否删除 1:是  -1:否',
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        `created_user` varchar(60) NOT NULL DEFAULT '' COMMENT '创建人',
        `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        `updated_user` varchar(60) NOT NULL DEFAULT '' COMMENT '更新人',
        PRIMARY KEY (`id`),
        UNIQUE KEY `unique_business_key` (`business_key`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8 COMMENT = '已授权的调用方表';
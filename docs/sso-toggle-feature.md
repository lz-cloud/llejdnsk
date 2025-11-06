# SSO启用/禁用功能说明

## 功能概述

管理员可以通过管理后台方便地启用或禁用SSO配置，无需删除配置信息。当SSO配置被禁用后，用户将无法使用该配置进行单点登录。

## 功能特性

### 1. 快速切换
- 在SSO配置管理页面，每个配置都有一个开关按钮
- 点击开关即可快速启用或禁用配置
- 状态变更实时生效，无需重启服务

### 2. 安全控制
- 当SSO配置被禁用时，使用该配置的登录请求将被拒绝
- 返回错误信息："SSO configuration not found or inactive"
- 已登录的用户不受影响，只影响新的登录请求

### 3. 配置保留
- 禁用配置不会删除配置信息
- 所有加密参数、IP白名单等配置都会保留
- 随时可以重新启用，无需重新配置

## 使用指南

### 管理员操作

1. **查看SSO配置列表**
   - 登录管理后台
   - 进入"SSO配置管理"页面
   - 查看所有SSO配置及其状态

2. **启用SSO配置**
   - 在配置列表中找到需要启用的配置
   - 将"状态"列的开关切换到"开"的位置
   - 系统显示"已启用SSO配置"提示
   - 用户可以使用该配置进行登录

3. **禁用SSO配置**
   - 在配置列表中找到需要禁用的配置
   - 将"状态"列的开关切换到"关"的位置
   - 系统显示"已禁用SSO配置"提示
   - 用户无法使用该配置进行登录

### 界面说明

SSO配置管理页面包含以下列：
- **名称**: SSO配置的名称
- **DES Key**: 加密密钥
- **DES IV**: 初始化向量
- **Padding**: 填充方式
- **模式**: 加密模式
- **有效期(分钟)**: 令牌有效期
- **状态**: 开关按钮，可快速切换启用/禁用
- **操作**: 编辑和删除按钮

## API接口

### 获取单个SSO配置
```http
GET /api/admin/sso-configs/:id
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "主SSO配置",
    "desKey": "12345678",
    "desIV": "12345678",
    "desPadding": "pkcs5padding",
    "desMode": "CBC",
    "tokenValidity": 5,
    "isActive": true,
    "allowedIPs": ["192.168.1.100"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 启用/禁用SSO配置
```http
PATCH /api/admin/sso-configs/:id
Content-Type: application/json

{
  "isActive": true
}
```

**请求参数:**
- `isActive` (boolean, 必填): true为启用，false为禁用

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "主SSO配置",
    "isActive": true,
    ...
  },
  "message": "SSO config enabled successfully"
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "isActive must be a boolean"
}
```

## 技术实现

### 后端实现

1. **数据模型**
   - `SSOConfig` 表中已有 `isActive` 字段
   - 类型: `Boolean`
   - 默认值: `true`

2. **服务层** (`adminService.ts`)
   ```typescript
   async toggleSSOConfig(id: string, isActive: boolean) {
     return prisma.sSOConfig.update({
       where: { id },
       data: { isActive },
     });
   }
   ```

3. **控制器** (`adminController.ts`)
   ```typescript
   export const toggleSSOConfig = async (req: Request, res: Response) => {
     const { isActive } = req.body;
     if (typeof isActive !== 'boolean') {
       return res.status(400).json({ 
         success: false, 
         message: 'isActive must be a boolean' 
       });
     }
     const config = await adminService.toggleSSOConfig(req.params.id, isActive);
     res.json({ 
       success: true, 
       data: config, 
       message: `SSO config ${isActive ? 'enabled' : 'disabled'} successfully` 
     });
   };
   ```

4. **登录验证** (`authService.ts`)
   ```typescript
   const ssoConfig = await prisma.sSOConfig.findUnique({
     where: { id: data.ssoConfigId },
   });

   if (!ssoConfig || !ssoConfig.isActive) {
     throw new Error('SSO configuration not found or inactive');
   }
   ```

### 前端实现

1. **服务层** (`adminService.ts`)
   ```typescript
   async toggleSSOConfig(id: string, isActive: boolean): Promise<SSOConfig> {
     const { data } = await api.patch(`/admin/sso-configs/${id}`, { isActive });
     return data.data;
   }
   ```

2. **页面组件** (`SSOConfigPage.tsx`)
   ```typescript
   const handleToggle = async (record: SSOConfig, checked: boolean) => {
     try {
       await adminService.toggleSSOConfig(record.id, checked);
       message.success(`已${checked ? '启用' : '禁用'}SSO配置`);
       setConfigs((prev) => 
         prev.map((config) => 
           config.id === record.id 
             ? { ...config, isActive: checked } 
             : config
         )
       );
     } catch (error: any) {
       message.error(error.response?.data?.message || '更新状态失败');
     }
   };
   ```

3. **UI组件**
   ```tsx
   {
     title: '状态',
     dataIndex: 'isActive',
     key: 'isActive',
     render: (_: boolean, record: SSOConfig) => (
       <Switch
         checked={record.isActive}
         onChange={(checked) => handleToggle(record, checked)}
       />
     ),
   }
   ```

## 使用场景

### 1. 临时维护
当SSO提供商进行系统维护时，可以临时禁用该配置，避免用户登录失败。维护完成后重新启用即可。

### 2. 安全事件响应
如果发现某个SSO配置存在安全问题，可以立即禁用该配置，阻止新的登录请求。

### 3. 测试和生产隔离
可以为测试和生产环境创建不同的SSO配置，通过启用/禁用来控制哪个配置生效。

### 4. 逐步迁移
在从旧的SSO系统迁移到新系统时，可以同时配置两个SSO，通过启用/禁用来控制切换时机。

## 注意事项

1. **已登录用户**: 禁用SSO配置不会影响已经登录的用户，他们的会话仍然有效

2. **权限要求**: 只有管理员（ADMIN角色）可以启用/禁用SSO配置

3. **审计日志**: 所有的启用/禁用操作都会记录在审计日志中

4. **至少保留一个**: 建议至少保留一个启用的登录方式（本地登录或OAuth2），避免所有SSO配置都被禁用导致无法登录

## 测试建议

### 功能测试
1. 创建一个SSO配置并启用
2. 使用该配置进行登录，验证登录成功
3. 禁用该SSO配置
4. 再次使用该配置尝试登录，验证登录失败
5. 重新启用该SSO配置
6. 验证可以正常登录

### API测试
```bash
# 启用SSO配置
curl -X PATCH http://localhost:5000/api/admin/sso-configs/{id} \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'

# 禁用SSO配置
curl -X PATCH http://localhost:5000/api/admin/sso-configs/{id} \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

## 常见问题

**Q: 禁用SSO配置后，配置信息会丢失吗？**
A: 不会。禁用只是将`isActive`字段设置为`false`，所有配置信息都会保留。

**Q: 可以同时启用多个SSO配置吗？**
A: 可以。系统支持多个SSO配置同时启用，通过不同的配置ID来区分。

**Q: 禁用SSO配置后，已登录的用户会被强制退出吗？**
A: 不会。已登录用户的会话不受影响，只有新的登录请求会被拒绝。

**Q: 如何查看SSO配置的启用/禁用历史？**
A: 可以通过审计日志查看所有的配置变更记录。

## 相关文档

- [SSO配置指南](./sso-configuration.md)
- [管理员操作手册](./admin-guide.md)
- [API文档](http://localhost:5000/api-docs)

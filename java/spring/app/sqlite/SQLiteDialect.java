package app.sqlite;

import org.hibernate.boot.Metadata;
import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.function.CommonFunctionFactory;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;
import org.hibernate.mapping.Table;
import org.hibernate.tool.schema.internal.StandardTableExporter;
import org.hibernate.tool.schema.spi.Exporter;

import java.sql.Types;

public class SQLiteDialect extends Dialect {
    public SQLiteDialect() {
        super();
        // Базовые типы
        registerColumnType(Types.INTEGER, "integer");
        registerColumnType(Types.VARCHAR, "text");
        registerColumnType(Types.BIGINT, "integer");
        registerColumnType(Types.BOOLEAN, "integer");
        registerColumnType(Types.TIMESTAMP, "datetime");
        new CommonFunctionFactory(this).ansiTrunc(); // мелкая поддержка функций
    }

    @Override
    public Exporter<Table> getTableExporter() {
        // Упростим экспорт таблиц (без foreign key ограничений на уровне схемы, их обеспечим на уровне JPA)
        return new StandardTableExporter(this);
    }

    @Override
    public boolean supportsIdentityColumns() { return true; }

    @Override
    public String getIdentityColumnString(int type) { return "integer"; }

    @Override
    public String getIdentitySelectString(String table, String column, int type) {
        return "select last_insert_rowid()";
    }

    @Override
    public void contributeTypes(org.hibernate.boot.model.TypeContributions typeContributions,
                                org.hibernate.service.ServiceRegistry serviceRegistry) {
        super.contributeTypes(typeContributions, serviceRegistry);
    }

    @Override
    public void initializeFunctionRegistry(org.hibernate.query.sqm.function.SqmFunctionRegistry registry) {
        super.initializeFunctionRegistry(registry);
    }
}

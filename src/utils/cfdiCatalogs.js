/**
 * Catálogos CFDI v4.0
 * Valores estandarizados según SAT
 */

export const pagoFormas = [
  { value: "01", title: "01-Efectivo" },
  { value: "02", title: "02-Cheque nominativo" },
  { value: "03", title: "03-Transferencia electrónica de fondos" },
  { value: "04", title: "04-Tarjeta de crédito" },
  { value: "05", title: "05-Monedero electrónico" },
  { value: "06", title: "06-Dinero electrónico" },
  { value: "08", title: "08-Vales de despensa" },
  { value: "12", title: "12-Dación en pago" },
  { value: "13", title: "13-Pago por subrogación" },
  { value: "14", title: "14-Pago por consignación" },
  { value: "15", title: "15-Condonación" },
  { value: "17", title: "17-Compensación" },
  { value: "23", title: "23-Novación" },
  { value: "24", title: "24-Confusión" },
  { value: "25", title: "25-Remisión de deuda" },
  { value: "26", title: "26-Prescripción o caducidad" },
  { value: "27", title: "27-A satisfacción del acreedor" },
  { value: "28", title: "28-Tarjeta de débito" },
  { value: "29", title: "29-Tarjeta de servicios" },
  { value: "30", title: "30-Aplicación de anticipos" },
  { value: "31", title: "31-Intermediario pagos" },
  { value: "99", title: "99-Por definir" },
];

export const metodoPagos = [
  { value: "PUE", title: "PUE-Pago en una sola exhibición" },
  { value: "PPD", title: "PPD-Pago en parcialidades o diferido" },
];

export const cdfiUsos = [
  { value: "G01", title: "G01-Adquisición de mercancías." },
  { value: "G02", title: "G02-Devoluciones, descuentos o bonificaciones." },
  { value: "G03", title: "G03-Gastos en general." },
  { value: "I01", title: "I01-Construcciones." },
  {
    value: "I02",
    title: "I02-Mobiliario y equipo de oficina por inversiones.",
  },
  { value: "I03", title: "I03-Equipo de transporte." },
  { value: "I04", title: "I04-Equipo de cómputo y accesorios." },
  {
    value: "I05",
    title: "I05-Dados, troqueles, moldes, matrices y herramental.",
  },
  { value: "I06", title: "I06-Comunicaciones telefónicas." },
  { value: "I07", title: "I07-Comunicaciones satelitales." },
  { value: "I08", title: "I08-Otra maquinaria y equipo." },
  {
    value: "D01",
    title: "D01-Honorarios médicos, dentales y gastos hospitalarios.",
  },
  { value: "D02", title: "D02-Gastos médicos por incapacidad o discapacidad." },
  { value: "D03", title: "D03-Gastos funerales." },
  { value: "D04", title: "D04-Donativos." },
  {
    value: "D05",
    title:
      "D05-Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).",
  },
  { value: "D06", title: "D06-Aportaciones voluntarias al SAR." },
  { value: "D07", title: "D07-Primas por seguros de gastos médicos." },
  { value: "D08", title: "D08-Gastos de transportación escolar obligatoria." },
  {
    value: "D09",
    title:
      "D09-Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.",
  },
  { value: "D10", title: "D10-Pagos por servicios educativos (colegiaturas)." },
  { value: "S01", title: "S01-Sin efectos fiscales." },
  { value: "CP01", title: "CP01-Pagos" },
  { value: "CN01", title: "CN01-Nómina" },
];

export const tiposRelacion = [
  { title: "01 - Nota de crédito de los documentos relacionados", value: "01" },
  { title: "02 - Nota de débito de los documentos relacionados", value: "02" },
  { title: "03 - Devolución de mercancía sobre facturas o traslados previos", value: "03" },
  { title: "04 - Sustitución de los CFDI previos", value: "04" },
  { title: "05 - Traslados de mercancías facturados previamente", value: "05" },
  { title: "06 - Factura generada por los traslados previos", value: "06" },
  { title: "07 - CFDI por aplicación de anticipo", value: "07" },
];

export const fiscalRegimenes = [
  { "value": "601", "title": "601 - General de Ley Personas Morales" },
  { "value": "603", "title": "603 - Personas Morales con Fines no Lucrativos" },
  { "value": "605", "title": "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { "value": "606", "title": "606 - Arrendamiento" },
  { "value": "607", "title": "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { "value": "608", "title": "608 - Demás ingresos" },
  { "value": "610", "title": "610 - Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { "value": "611", "title": "611 - Ingresos por Dividendos (socios y accionistas)" },
  { "value": "612", "title": "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { "value": "614", "title": "614 - Ingresos por intereses" },
  { "value": "615", "title": "615 - Régimen de los ingresos por obtención de premios" },
  { "value": "616", "title": "616 - Sin obligaciones fiscales" },
  { "value": "620", "title": "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { "value": "621", "title": "621 - Incorporación Fiscal" },
  { "value": "622", "title": "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { "value": "623", "title": "623 - Opcional para Grupos de Sociedades" },
  { "value": "624", "title": "624 - Coordinados" },
  { "value": "625", "title": "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { "value": "626", "title": "626 - Régimen Simplificado de Confianza" },
];

export const tiposFactura = [
  { title: "Ingreso", value: "ingreso" },
  { title: "Egreso", value: "egreso" },
  // { title: "Traslado", value: "traslado" },
  // { title: "Nómina", value: "nomina" },
  { title: "Pago", value: "pago" },
];

export const monedas = [
  { value: "MXN", title: "Peso Mexicano" },
  { value: "USD", title: "Dólar Estadounidense" },
  { value: "EUR", title: "Euro" },
];

export const meses = [
  { value: "01", title: "Enero" },
  { value: "02", title: "Febrero" },
  { value: "03", title: "Marzo" },
  { value: "04", title: "Abril" },
  { value: "05", title: "Mayo" },
  { value: "06", title: "Junio" },
  { value: "07", title: "Julio" },
  { value: "08", title: "Agosto" },
  { value: "09", title: "Septiembre" },
  { value: "10", title: "Octubre" },
  { value: "11", title: "Noviembre" },
  { value: "12", title: "Diciembre" },
];

export const periodicidades = [
  { value: "01", title: "Diario" },
  { value: "02", title: "Semanal" },
  { value: "03", title: "Quincenal" },
  { value: "04", title: "Mensual" },
];

export const motivosCancelacion = [
  { title: "01 - Comprobantes emitidos con errores con relación", value: "01" },
  { title: "02 - Comprobantes emitidos con errores sin relación", value: "02" },
  { title: "03 - No se llevo a cabo la operacion", value: "03" },
  { title: "04 - Operación nominativa relacionada en una factura global", value: "04" },
];

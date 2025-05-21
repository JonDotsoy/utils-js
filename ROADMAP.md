## Objective of this document

This document serves as a public declaration of the improvements that will be made to our project. It outlines the key milestones, goals, and timelines for the development and delivery of these enhancements.

## Roadmap

The following roadmap provides an overview of the planned features, their expected release dates, and the current status:

### 🚧 Active

<!--
| Feature | Expected Release Date |
| --- | --- |
| User Interface Updates | Q2 2023 |
| Improved Performance | Q3 2023 |
-->

| Feature | Expected Release Date |
| ------- | --------------------- |

### ⏳ Planned

<!--
| Feature | Status | Expected Completion Date |
| --- | --- | --- |
| Bug Fixing | In Progress | March 15, 2023 |
| New Features Development | In Progress | April 30, 2023 |
-->

| Feature | Status | Expected Completion Date |
| ------- | ------ | ------------------------ |

## Proposals

The following proposal outlines a potential feature and its expected timeline:

<!--
### Proposal: [Insert Proposal Title]

[Description]
-->

### Feature: Soporte a Query para Simplificar Búsquedas con la Librería Visit

Esta feature consiste en desarrollar una clase o utilidad llamada `query` que permita simplificar y abstraer las búsquedas realizadas utilizando la librería `visit`. El objetivo es ofrecer una interfaz más sencilla y declarativa para realizar consultas sobre estructuras de datos, facilitando la obtención de resultados específicos sin necesidad de escribir lógica repetitiva o compleja. Esta utilidad debe integrarse de manera natural con el flujo actual de la librería `visit` y documentar ejemplos de uso para los casos más comunes.

#### Sintaxis esperada

- `query()`: retorna todos los nodos y debe entregar una instancia de la clase `Query`.
- `query().instanceOf(<CLASS>)`: retorna solo elementos de la clase definida.
- `query.of([...queries])`: permite unir varias condiciones.
- `query().hasProperty(symbol|string)`: valida que exista la propiedad.
- Concatenación de propiedades: `query().hasProperty('child').hasProperty('name')`.
- Validación de valor: `query().hasProperty('name').equal('jhon')`.

La utilidad debe soportar:

- Composición de condiciones y validación de propiedades y valores de manera encadenada.
- Consultas expresivas y potentes sobre los nodos recorridos por la librería `visit`.
- Encadenamiento de múltiples condiciones `hasProperty`.
- Validación de valores específicos tras la existencia de la propiedad.
- Uso de `query.of([...queries])` para combinar condiciones.

##### Ejemplos de uso

- `query()`: retorna todos los nodos.
- `query().instanceOf(Person)`: retorna nodos que sean instancia de la clase `Person`.
- `query().hasProperty('child').hasProperty('name')`: retorna nodos que tengan la propiedad `child` y dentro de `child` la propiedad `name`.
- `query().hasProperty('name').equal('jhon')`: retorna nodos cuya propiedad `name` sea igual a `'jhon'`.
- `query.of([query().instanceOf(Person), query().hasProperty('active').equal(true)])`: retorna nodos que sean instancia de `Person` y tengan la propiedad `active` igual a `true`.

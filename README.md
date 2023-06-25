# ExcellenToSQL

`.xlsx` 파일을 SQL문으로 변환해주는 페이지입니다.

## Authors

- [@yeongseokim](https://www.github.com/yeongseokim)

## Demo


## Usage/Examples

1. Upload `.xlsx` file
2. Set Data Types
3. Set Constraints
4. Modify the data table
5. `.sql` Download or Copy


## Features
- 아래와 같이 작성된 .xlsx 파일에 대해 동작합니다.
> |1| attribute1| attribute2|...|
> |-| --------- | --------- | - |
> |2| data11 | data12 |...|
> |3| data21 | data22 |...|
> |4| data31 | data32 |...|
> |...| ... | ... |...|
- 각 시트가 생성할 데이터베이스의 테이블이 됩니다.
    - 시트의 이름은 클릭하여 수정할 수 있으며 `Enter` 키를 눌러야 반영됩니다.
- 각 시트의 첫 번째 행(제목)이 애트리뷰트의 이름이 됩니다.
    - 애트리뷰트 이름은 수정할 수 없습니다.
- 각 시트의 데이터는 표 형태로 상단에 표시됩니다.
    - 데이터는 수정할 수 있으며 `Enter` 키를 눌러야 반영됩니다.
    - 빈 문자열은 값이 없는 것으로 처리합니다.
    - 기본 키, NOT NULL로 설정된 애트리뷰트의 경우 null 값으로 수정할 수 없습니다.
    - 기본 키, UNIQUE로 설정된 애트리뷰트의 경우 중복 값으로 수정할 수 없습니다.
- 하단의 테이블 이름 버튼을 클릭하면 애트리뷰트의 데이터 타입 조정, 기본 키 설정, 참조 키 설정, NOT NULL, UNIQUE, DEFAULT 설정 블록이 토글됩니다.
    - 애트리뷰트 클릭 시 해당 부분의 SQL문으로 이동됩니다.
- `데이터타입`은 INT, DATE, BOOLEAN, TIME, DATETIME, TIMESTAMP, YEAR, BIGINT, TINYINT, SMALLINT, MEDIUMINT, FLOAT, DOUBLE, CHAR, VARCHAR, BLOB, TEXT, TINYTEXT, LONGTEXT, MEDIUMTEXT, ENUM, DECIMAL 선택 가능
    - 엑셀 파일 업로드 시 첫 번째 데이터 행을 보고 임의로 데이터타입 설정
    - 데이터 길이를 재서 데이터 길이 명시 타입의 경우 표시
    - 데이터 길이 비명시 타입은 대소문자 구분 없이 `datatype` 입력
    - 데이터 길이 명시 타입은 대소문자 구분 없이 `datatype(length)` 입력
    - DATE, TIME, DATETIME 데이터타입 선택 시 `YYYY-MM-DD`, `HH:MM` 형식으로 변환
    - 데이터 길이는 수정 가능하나 maxlength보다 작은 값으로 수정 불가
- `PK` 버튼을 통해 해당 애트리뷰트를 Primary Key로 설정할 수 있습니다.
    - 중복 데이터가 존재하는 경우 PK가 ![#ffbb00](https://via.placeholder.com/10/ffbb00?text=+)`#ffbb00` 색상입니다.
        - 문제가 발생한 데이터에 대하여 데이터 테이블에 ![#F65353](https://via.placeholder.com/10/F65353?text=+)`#F65353` 색상 테두리로 표시됩니다.
        - 다른 애트리뷰트의 PK 버튼을 클릭하여 복합 키 조합으로 중복이 없을 경우 PK가 ![#08874A](https://via.placeholder.com/10/08874A?text=+)`#08874A` 색상이 적용됩니다.
    - 정상적으로 반영된 경우 PK가 ![#08874A](https://via.placeholder.com/10/08874A?text=+)`#08874A` 색상입니다.
- `FK` 버튼을 통해 해당 애트리뷰트를 Foreign Key로 설정할 수 있습니다.
    - 정상적으로 반영된 경우 FK가 ![#08874A](https://via.placeholder.com/10/08874A?text=+)`#08874A` 색상입니다.
    - `테이블.애트리뷰트`를 드롭 다운으로 선택
    - 참조하는 애트리뷰트의 데이터타입과 일치하지 않을 경우 적용되지 않습니다.
    - 참조하는 애트리뷰트의 도메인에 포함되지 않을 경우 적용되지 않습니다.
- `NOT NULL`: 해당 애트리뷰트 데이터에 NULL 값이 있는지 검사합니다.
    - 데이터에 NULL 값이 있으면 반영되지 않습니다.
    - 문제가 발생한 데이터에 대하여 데이터 테이블에 ![#F65353](https://via.placeholder.com/10/F65353?text=+)`#F65353` 색상 테두리로 표시됩니다.
- `UNIQUE`: 해당 애트리뷰트 데이터에 중복 값이 있는지 검사합니다.
    - 중복 데이터가 있으면 반영되지 않습니다.
    - 문제가 발생한 데이터에 대하여 데이터 테이블에 ![#F65353](https://via.placeholder.com/10/F65353?text=+)`#F65353` 색상 테두리로 표시됩니다.
- `DEFAULT`: text 칸에 default로 설정할 값을 입력하고 `Enter` 키를 눌러야 반영되며 CREATE문에 표시됩니다.
- `DOWNLOAD`나 `COPY` 버튼을 클릭하면 테이블간 참조 의존성에 맞게 순서가 정렬됩니다.
    - DOWNLOAD 버튼을 클릭하면 `YYYYMMDDExcellenToSQL.sql` 파일이 다운로드 됩니다.
    - COPY 버튼을 클릭하면 클립보드에 표시된 SQL문이 복사됩니다.
    - 다시 애트리뷰트를 수정하면 업로드 했을 때의 테이블 표시 순서에 따라 정렬됩니다.
- 데이터와 설정 내역은 `LocalStorage`에 저장되며 Title `ExcellenToSQL`을 클릭하여 초기화할 수 있습니다.

## Skills
<p>
<img src="https://img.shields.io/badge/html5-E34F26?style=flat-square&logo=html5&logoColor=white"> 
<img src="https://img.shields.io/badge/css-1572B6?style=flat-square&logo=css3&logoColor=white"> 
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"> 
</p>
import { describe } from 'mocha'
import { expect } from 'chai'
import { extractInfoFromFolderName, formatDate } from '../scripts/utils'

describe('utils regex', function () {
    it('match folder number (01_Roadtrip)', function () {
        let result = extractInfoFromFolderName("01_Roadtrip", 0);
        expect(result.name).equal('Roadtrip');
        expect(result.pageNumber).equal(1);
    });

    it('match folder name with date (20180218_Roadtrip)', function () {
        let result = extractInfoFromFolderName("20180218_Roadtrip", 0);
        expect(result.name).equal('Roadtrip');
        expect(result.pageNumber).equal(1);
        expect(result.date).equal(formatDate("2018", "2", "18"));
    });

    it('match folder name with date, but no day (201802_Roadtrip)', function () {
        let result = extractInfoFromFolderName("201802_Roadtrip", 0);
        expect(result.name).equal('Roadtrip');
        expect(result.pageNumber).equal(1);
        expect(result.date).equal(formatDate("2018", "2"));
    });

    it('match folder date, separated by _ (2018_02_18_Roadtrip)', function () {
        let result = extractInfoFromFolderName("2018_02_18_Roadtrip", 0);
        expect(result.name).equal('Roadtrip');
        expect(result.pageNumber).equal(1);
        expect(result.date).equal(formatDate("2018", "2", "18"));
    });


    it('match folder date, separated by _, without day(2018_02_18_Roadtrip)', function () {
        let result = extractInfoFromFolderName("2018_02_Roadtrip", 0);
        expect(result.name).equal('Roadtrip');
        expect(result.pageNumber).equal(1);
        expect(result.date).equal(formatDate("2018", "2"));
    });

});
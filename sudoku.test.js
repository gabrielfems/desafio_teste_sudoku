'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const {
    criarTabuleiro,
    validarTamanho,
    validarValores,
    validarQuantidade,
    validarTresConsecutivos,
    obterColuna,
    validarLinhas,
    validarColunas,
    validarLinhasDuplicadas,
    validarColunasDuplicadas,
    validarTabuleiro,
    verificarTabuleiroCompleto
} = require('./sudoku');

const N = null;

// Tabuleiro 6x6 completo e válido (solução de referência).
const solucao = () => [
    [0, 0, 1, 0, 1, 1],
    [0, 0, 1, 1, 0, 1],
    [1, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 0]
];

const parcial = () => {
    const t = solucao();
    t[0][0] = N;
    t[2][3] = N;
    t[4][5] = N;
    t[5][1] = N;
    return t;
};

describe('Criação do tabuleiro', () => {
    test('CT01 - cria tabuleiro vazio 6x6', () => {
        const t = criarTabuleiro();
        assert.equal(t.length, 6);
        assert.ok(t.every(l => l.length === 6 && l.every(v => v === null)));
    });

    test('CT01 - linhas independentes e instâncias novas a cada chamada', () => {
        const a = criarTabuleiro();
        const b = criarTabuleiro();
        a[0][0] = 1;
        assert.equal(a[1][0], null);
        assert.equal(b[0][0], null);
    });
});

describe('Validação do tamanho', () => {
    test('CT02 - tabuleiro 6x6 aceito', () => {
        assert.equal(validarTamanho(criarTabuleiro()), true);
        assert.equal(validarTamanho(solucao()), true);
    });

    test('CT03 - menos de 6 linhas rejeitado', () => {
        assert.equal(validarTamanho(criarTabuleiro().slice(0, 5)), false);
        assert.equal(validarTamanho([]), false);
    });

    test('CT04 - mais de 6 linhas rejeitado', () => {
        assert.equal(validarTamanho([...criarTabuleiro(), Array(6).fill(N)]), false);
    });

    test('CT05 - linha com menos de 6 colunas rejeitada', () => {
        const t = criarTabuleiro();
        t[3] = Array(5).fill(N);
        assert.equal(validarTamanho(t), false);
    });

    test('CT06 - linha com mais de 6 colunas rejeitada', () => {
        const t = criarTabuleiro();
        t[0] = Array(7).fill(N);
        assert.equal(validarTamanho(t), false);
    });

    test('CT07 - valor que não é array rejeitado', () => {
        for (const v of [null, undefined, 'abc', 42, {}, true]) {
            assert.equal(validarTamanho(v), false);
        }
        const t = criarTabuleiro();
        t[2] = 'nnnnnn';
        assert.equal(validarTamanho(t), false);
    });
});

describe('Validação dos valores', () => {
    test('CT08 - valores 0, 1 e null aceitos', () => {
        assert.equal(validarValores(criarTabuleiro()), true);
        assert.equal(validarValores(parcial()), true);
        assert.equal(validarValores(solucao()), true);
    });

    test('CT09 - valor 2 rejeitado', () => {
        const t = criarTabuleiro();
        t[1][1] = 2;
        assert.equal(validarValores(t), false);
    });

    test('CT10 - valor negativo rejeitado', () => {
        const t = criarTabuleiro();
        t[0][0] = -1;
        assert.equal(validarValores(t), false);
    });

    test('CT11 - valor do tipo texto rejeitado', () => {
        for (const v of ['0', '1', 'x']) {
            const t = criarTabuleiro();
            t[0][0] = v;
            assert.equal(validarValores(t), false, `valor "${v}"`);
        }
    });

    test('CT11 - outros tipos inválidos rejeitados (boolean, undefined, NaN, decimal)', () => {
        for (const v of [true, false, undefined, NaN, 0.5, {}, []]) {
            const t = criarTabuleiro();
            t[2][2] = v;
            assert.equal(validarValores(t), false, `valor ${String(v)}`);
        }
    });

    test('CT12 - tabuleiro com tamanho incorreto rejeitado', () => {
        assert.equal(validarValores([[0, 1]]), false);
        assert.equal(validarValores(null), false);
    });
});

describe('Quantidade de zeros e uns', () => {
    test('CT13 - três zeros e três uns aceito', () => {
        assert.equal(validarQuantidade([0, 1, 0, 1, 0, 1]), true);
        assert.equal(validarQuantidade([0, 0, 0, 1, 1, 1]), true);
    });

    test('CT14 - linha incompleta dentro dos limites aceita', () => {
        assert.equal(validarQuantidade([N, N, N, N, N, N]), true);
        assert.equal(validarQuantidade([0, 0, 0, N, N, N]), true);
        assert.equal(validarQuantidade([1, N, 1, N, 0, N]), true);
    });

    test('CT15 - mais de três zeros rejeitado', () => {
        assert.equal(validarQuantidade([0, 0, 0, 0, 1, 1]), false);
        assert.equal(validarQuantidade([0, 0, 0, 0, 0, 0]), false);
    });

    test('CT16 - mais de três uns rejeitado', () => {
        assert.equal(validarQuantidade([1, 1, 1, 1, 0, 0]), false);
        assert.equal(validarQuantidade([1, 1, 1, 1, 1, 1]), false);
    });
});

describe('Números consecutivos', () => {
    test('CT17 - linha sem três iguais consecutivos aceita', () => {
        assert.equal(validarTresConsecutivos([0, 0, 1, 1, 0, 1]), true);
        assert.equal(validarTresConsecutivos([0, 0, 1, 1, 0, 0]), true);
    });

    test('CT18 - três zeros consecutivos rejeitado (início, meio e fim)', () => {
        assert.equal(validarTresConsecutivos([0, 0, 0, 1, 1, N]), false);
        assert.equal(validarTresConsecutivos([1, 0, 0, 0, 1, N]), false);
        assert.equal(validarTresConsecutivos([1, 1, N, 0, 0, 0]), false);
    });

    test('CT19 - três uns consecutivos rejeitado (início, meio e fim)', () => {
        assert.equal(validarTresConsecutivos([1, 1, 1, 0, 0, N]), false);
        assert.equal(validarTresConsecutivos([0, 1, 1, 1, 0, N]), false);
        assert.equal(validarTresConsecutivos([0, 0, N, 1, 1, 1]), false);
    });

    test('CT20 - posições vazias entre os valores aceitas', () => {
        assert.equal(validarTresConsecutivos([N, N, N, N, N, N]), true);
        assert.equal(validarTresConsecutivos([0, 0, N, 0, 0, N]), true);
        assert.equal(validarTresConsecutivos([0, N, N, N, 1, 1]), true);
    });
});

describe('Obtenção de colunas', () => {
    test('CT21 - retorna a coluna correta na ordem das linhas', () => {
        const t = solucao();
        assert.deepEqual(obterColuna(t, 0), [0, 0, 1, 0, 1, 1]);
        assert.deepEqual(obterColuna(t, 5), [1, 1, 0, 1, 0, 0]);
    });

    test('CT21 - preserva null e não altera o tabuleiro', () => {
        const t = criarTabuleiro();
        t[2][4] = 1;
        const copia = JSON.parse(JSON.stringify(t));
        const col = obterColuna(t, 4);
        assert.deepEqual(col, [N, N, 1, N, N, N]);
        col[0] = 9;
        assert.deepEqual(t, copia);
    });
});

describe('Validação das linhas', () => {
    test('CT22 - linhas que respeitam as regras aceitas', () => {
        assert.equal(validarLinhas(criarTabuleiro()), true);
        assert.equal(validarLinhas(parcial()), true);
        assert.equal(validarLinhas(solucao()), true);
    });

    test('CT23 - três valores iguais consecutivos rejeitados', () => {
        const t = criarTabuleiro();
        t[4] = [N, 1, 1, 1, N, N];
        assert.equal(validarLinhas(t), false);
    });

    test('CT24 - quantidade excessiva de zeros rejeitada', () => {
        const t = criarTabuleiro();
        t[2] = [0, 1, 0, 0, N, 0];
        assert.equal(validarLinhas(t), false);
    });

    test('CT24 - validarLinhas não avalia colunas', () => {
        const t = criarTabuleiro();
        for (let i = 0; i < 3; i++) t[i][0] = 0;
        assert.equal(validarLinhas(t), true);
    });
});

describe('Validação das colunas', () => {
    test('CT25 - colunas que respeitam as regras aceitas', () => {
        assert.equal(validarColunas(criarTabuleiro()), true);
        assert.equal(validarColunas(parcial()), true);
        assert.equal(validarColunas(solucao()), true);
    });

    test('CT26 - três zeros consecutivos rejeitados', () => {
        const t = criarTabuleiro();
        [1, 2, 3].forEach(i => { t[i][3] = 0; });
        assert.equal(validarColunas(t), false);
    });

    test('CT26 - violação na última coluna é detectada', () => {
        const t = criarTabuleiro();
        [3, 4, 5].forEach(i => { t[i][5] = 1; });
        assert.equal(validarColunas(t), false);
    });

    test('CT27 - quantidade excessiva de uns rejeitada', () => {
        const t = criarTabuleiro();
        [0, 1, 3, 5].forEach(i => { t[i][1] = 1; });
        assert.equal(validarColunas(t), false);
    });

    test('CT27 - validarColunas não avalia linhas', () => {
        const t = criarTabuleiro();
        t[0] = [0, 0, 0, N, N, N];
        assert.equal(validarColunas(t), true);
    });
});

describe('Linhas duplicadas', () => {
    test('CT28 - linhas completas diferentes aceitas', () => {
        assert.equal(validarLinhasDuplicadas(solucao()), true);
        assert.equal(validarLinhasDuplicadas(criarTabuleiro()), true);
    });

    test('CT29 - linhas completas idênticas rejeitadas', () => {
        const t = solucao();
        t[3] = [...t[0]];
        assert.equal(validarLinhasDuplicadas(t), false);
        assert.equal(validarTabuleiro(t), false);
    });

    test('CT30 - linhas incompletas ignoram a comparação', () => {
        const t = criarTabuleiro();
        t[0] = [0, 1, 0, 1, N, N];
        t[1] = [0, 1, 0, 1, N, N];
        assert.equal(validarLinhasDuplicadas(t), true);
        assert.equal(validarTabuleiro(t), true);
    });
});

describe('Colunas duplicadas', () => {
    test('CT31 - colunas completas diferentes aceitas', () => {
        assert.equal(validarColunasDuplicadas(solucao()), true);
        assert.equal(validarColunasDuplicadas(criarTabuleiro()), true);
    });

    test('CT32 - colunas completas idênticas rejeitadas', () => {
        const t = solucao();
        for (let i = 0; i < 6; i++) t[i][3] = t[i][0];
        assert.equal(validarColunasDuplicadas(t), false);
        assert.equal(validarTabuleiro(t), false);
    });

    test('CT33 - colunas incompletas ignoram a comparação', () => {
        const t = criarTabuleiro();
        for (let i = 0; i < 4; i++) {
            t[i][0] = i % 2;
            t[i][1] = i % 2;
        }
        assert.equal(validarColunasDuplicadas(t), true);
        assert.equal(validarTabuleiro(t), true);
    });
});

describe('Validação geral do tabuleiro', () => {
    test('CT34 - tabuleiro que respeita todas as regras aceito', () => {
        assert.equal(validarTabuleiro(criarTabuleiro()), true);
        assert.equal(validarTabuleiro(parcial()), true);
        assert.equal(validarTabuleiro(solucao()), true);
    });

    test('CT34 - não altera o tabuleiro recebido', () => {
        const t = parcial();
        const copia = JSON.parse(JSON.stringify(t));
        validarTabuleiro(t);
        assert.deepEqual(t, copia);
    });

    test('CT35 - tabuleiro com valores inválidos rejeitado', () => {
        for (const v of [2, -1, '0', true, undefined]) {
            const t = criarTabuleiro();
            t[0][0] = v;
            assert.equal(validarTabuleiro(t), false, `valor ${String(v)}`);
        }
    });

    test('CT36 - tabuleiro com tamanho inválido rejeitado', () => {
        assert.equal(validarTabuleiro(null), false);
        assert.equal(validarTabuleiro([]), false);
        assert.equal(validarTabuleiro(solucao().slice(1)), false);
        assert.equal(validarTabuleiro([[0, 1]]), false);
    });
});

describe('Verificação do preenchimento', () => {
    test('CT37 - tabuleiro completamente preenchido identificado como completo', () => {
        assert.equal(verificarTabuleiroCompleto(solucao()), true);
    });

    test('CT37 - fluxo: preencher casa a casa até completar', () => {
        const alvo = solucao();
        const t = criarTabuleiro();
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 6; j++) {
                assert.equal(verificarTabuleiroCompleto(t), false);
                t[i][j] = alvo[i][j];
                assert.equal(validarTabuleiro(t), true, `inválido em [${i}][${j}]`);
            }
        }
        assert.equal(verificarTabuleiroCompleto(t), true);
    });

    test('CT38 - tabuleiro incompleto identificado como incompleto', () => {
        assert.equal(verificarTabuleiroCompleto(criarTabuleiro()), false);
        assert.equal(verificarTabuleiroCompleto(parcial()), false);
        const t = solucao();
        t[3][3] = N;
        assert.equal(verificarTabuleiroCompleto(t), false);
    });

    test('CT39 - tabuleiro completo que viola as regras rejeitado', () => {
        const dup = solucao();
        dup[3] = [...dup[0]];
        assert.equal(verificarTabuleiroCompleto(dup), false);

        const zeros = Array.from({ length: 6 }, () => Array(6).fill(0));
        assert.equal(verificarTabuleiroCompleto(zeros), false);
    });

    test('CT39 - tamanho ou valores inválidos também rejeitados', () => {
        assert.equal(verificarTabuleiroCompleto(null), false);
        const t = solucao();
        t[0][0] = '0';
        assert.equal(verificarTabuleiroCompleto(t), false);
    });
});
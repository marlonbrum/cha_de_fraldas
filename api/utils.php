<?php

function getFilePresentes()
{
    return __DIR__ . '/../data/presentes.json';
}

function listarPresentes()
{
    $filePath = getFilePresentes();
    if (!file_exists($filePath)) {
        return [];
    }
    $presentes = json_decode(file_get_contents($filePath), true);

    verificarIds($presentes);

    calcularDisponiveis($presentes);

    return $presentes;
}


function verificarIds(&$presentes)
{
    $max_id = 0;
    $alterar_id = false;
    foreach ($presentes as $presente) {
        if (isset($presente['id']))
            $max_id = max($max_id, $presente['id']);
        else
            $alterar_id = true;
    }

    if ($alterar_id)
    {
        foreach ($presentes as &$presente) {
            if (!isset($presente['id'])) {
                $presente['id'] = ++$max_id;
            }
        }
    }

    salvarPresentes($presentes);
}

function salvarPresentes($presentes)
{
    $filePath = getFilePresentes();
    file_put_contents($filePath, json_encode($presentes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function getDirEscolhas()
{
    return __DIR__ . '/../data/escolhas/';
}

function gravarEscolhas($presentes)
{    
    $fileID = uniqid("escolha_");
    $filePath = getDirEscolhas() . $fileID . '.json';
    
    $content = [
        'id' => $fileID,
        'data_hora' => date('Y-m-d H:i:s'),
        'ip_cliente' => $_SERVER['REMOTE_ADDR'],
        'presentes' => $presentes
    ];

    file_put_contents($filePath, json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function calcularDisponiveis(&$presentes)
{
    $dirEscolhas = getDirEscolhas();
    
    $files = glob($dirEscolhas . "escolha_*.json");    

    foreach($presentes as &$presente) {
        $qtd = isset($presente['quantidade']) ? $presente['quantidade'] : 1;
        $qtd = $qtd == null || $qtd == 0 ? 1 : $qtd;

        $presente['escolhido'] = 0;
        $presente['disponivel'] = $qtd;
    }

    foreach ($files as $file) {        
        $content = json_decode(file_get_contents($file), true);
        foreach ($content['presentes'] as $presenteEscolhido) {
            foreach ($presentes as &$presenteLista)
            {
                if ($presenteLista['id'] == $presenteEscolhido)
                {
                    $presenteLista['escolhido']++;
                    $presenteLista['disponivel']--;
                    if ($presenteLista['disponivel'] < 0)
                        $presenteLista['disponivel'] = 0;
                    break;
                }   
            }
        }
    }    
}

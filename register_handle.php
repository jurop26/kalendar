<?php

$json_form = file_get_contents("php://input");
$form = json_decode($json_form, true);

extract($form);

if (!$_SERVER['REQUEST_METHOD'] == 'POST') {
    header("Location:" . $_SERVER['HTTP_REFERER']);
    die();
}

if (empty($name) || empty($date) || empty($time)) {
    $response = array("message" => "Nezadali ste všetky údaje");
    die(json_encode($response));
}

if (empty($id)) {
    $id = uniqid();
    $form["id"] = $id;
}

$error = array("message" => "Chyba");

if (filesize("register.json")) {
    $json_file = fopen("register.json", "r") or die(json_encode($error));
    $existing_register = json_decode(fread($json_file, filesize("register.json")), true);
    fclose($json_file);

    $key = check_schedule_existence($existing_register, $id);

    if ($key !== false && isset($button)) {

        $existing_register = delete_schedule($existing_register, $key);
        $response = array("message" => "Rezervácia vymazaná");
        unset($button);
    } elseif ($key !== false && !isset($button)) {

        $existing_register = change_schedule($existing_register, $key, $form);
        $response = array("message" => "Rezervácia zmenená");
    } else {

        $existing_register = create_schedule($existing_register, $form);
        $response = array("message" => "Rezervácia vytvorená");
    }

    $json_existing_register = json_encode($existing_register);

    $json_file = fopen("register.json", "w") or die(json_encode($error));
    fwrite($json_file, $json_existing_register);
    fclose($json_file);
} else {
    $json_file = fopen("register.json", "w") or die(json_encode($error));
    $existing_register[] = $form;
    $json_existing_register = json_encode($existing_register);
    fwrite($json_file, $json_existing_register);
    fclose($json_file);
}

die(json_encode($response));

function create_schedule($existing_register, $form)
{
    $existing_register[] = $form;
    return $existing_register;
}

function change_schedule($existing_register, $key, $form)
{
    $existing_register["$key"] = $form;
    return $existing_register;
}

function delete_schedule($existing_register, $key)
{
    array_splice($existing_register, $key, 1);
    return $existing_register;
}

function check_schedule_existence($existing_register, $id)
{
    $ids = array_column($existing_register, "id");
    $key = array_search($id, $ids);
    if ($key !== false) return $key;
    return false;
}

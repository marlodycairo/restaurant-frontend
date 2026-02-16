

export const CreateNewReservation = () => {
  return (
    <div>
      <form className="form-control" onSubmit={(e) => e.preventDefault()}>
        <label className="form-label" >Customer</label>
        <input type="text" className="form-control" name="customerName" />
      </form>
    </div>
  )
}
